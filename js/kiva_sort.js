// TODO: fixed headers
// TODO: resizable columns
// TODO: load static/cached Kiva data

/** Kiva Sort: Jquery plugin for retrieving and displaying list of Kiva
 * field partners which may be sorted and filtered.
 **/
;(function ($, document, window) {
    "use strict";

    var partnersURL = 'http://www.kiva.org/partners/';    
    var apiURL = 'http://api.kivaws.org/v1/partners.json';    
    var undefinedValue = 999;
    var naText = '-'; // text to display when a value is N/A
    var numericColumns = ['average_loan_size_percent_per_capita_income', 'currency_exchange_loss_rate', 'default_rate', 'delinquency_rate', 'id', 'loans_at_risk_rate', 'loans_posted', 'portfolio_yield', 'profitability', 'total_amount_raised']; 
    var percentColumns = [ 'average_loan_size_percent_per_capita_income', 'currency_exchange_loss_rate', 'default_rate', 'delinquency_rate', 'loans_at_risk_rate', 'portfolio_yield', 'profitability'];
    var textColumns = ['due_diligence_type', 'name', 'rating', 'status', 'url'];
    var linkColumns = ['name', 'url'];

    var defaults = {
        ajax: fetchData,
        columnDefs: [{
            targets: "_all",
            data: getData
        }]
    };

    function getData(row, type, set, meta) {
        var colName = meta.settings.nTable.columns[meta.col];
        var field = row[colName];

        if (type == "sort" || type == "type") {
            // For sorting and type detection, return the raw JSON data
            return field;
        }

        // For display and filtering, format things nicely

        // Catch all the 'undefined' fields
        if (field === undefined || field == undefinedValue) {
            return naText;
        }

        // Handle specific columns
        switch (colName) {
            case 'id':
                return $('<a></a>', {
                text: field,
                href: partnersURL + field
            })[0].outerHTML;
            break;
            case 'loans_posted': 
                return field.toLocaleString();
            break;
            case 'start_date':
                if (field) {
                var date = new Date(field);
                var dateHTML = $('<time></time>', {
                    datetime: field,
                    text: date.toLocaleDateString()
                });
                return dateHTML[0].outerHTML;
            }
            return naText;
            break;
            case 'total_amount_raised':
                return '$' + field.toLocaleString();
            break;
        }

        // Handle other column types
        if ($.inArray(colName, percentColumns) != -1) {
            return field.toFixed(2) + '%';
        } else if ($.inArray(colName, linkColumns) != -1) {
            return writeLink(row, colName);
        }

        /* Catch-all (including plain text and numeric columns): pass through
         * raw string */
        return field;
    }

    function writeLink(record, column) {
        // build tag attributes to pass to jQuery()
        if (record[column]) {
            var tagAttr = { text: record[column] };
            if (record.url) {
                tagAttr.href = record.url;
            }
            var HTML = $('<a></a>', tagAttr);
            return HTML[0].outerHTML;
        }
        return naText;
    }

    // Get list of column names (thead) for the given jquery table element
    // returns an array of strings
    function columnNames(table) {
        return table.find('th').map(function () { 
            var title = $.trim($(this).text());
            return title.replace(/\s/g, '_').toLowerCase();
        }).get();
    }

    // Namespace for global plugin state
    var KivaSort = {};

    /* KivaSort.tables is a global array of each table element (not jquery
     * object) the plugin is applied to */
    KivaSort.tables = [];

    // Static property to store state of JSON fetching
    // TODO: handle failure of JSON fetch
    KivaSort.fetchedJSON = new $.Deferred();

    // Object to store json
    KivaSort.fetchedJSON.data = {};

    // The jQuery function to apply KivaSort to table elements
    // TODO: filter out non-table elements
    $.fn.makeKivaTable = function(opts) {

        // Add to the global list of tables
        $.merge(KivaSort.tables, this);

        return this.each(function(index, table) {
            var $table = $(table);

            /* merge the user-provided options for DataTables with our defaults */
            $.extend(true, table.opts, defaults, opts);

            /* Get the column names from the bare-bones HTML table provided by the
             * user */
            table.columns = columnNames($(table));

            // Apply DataTables to our table element
            $(table).DataTable(defaults);
        });
    };

    // JQuery function to remove KivaSort from table elements
    $.fn.removeKivaTable = function(opts) {
        return this.each(function(index, table) {
            // remove from KivaSort.tables
            KivaSort.tables = $.grep(KivaSort.tables, function(t) {
                return t != table;
            });

            $(table).DataTable().clear().destroy();
        });
    }

    // Re-fetch the JSON data from the server
    KivaSort.refreshJSON = function() {
        delete KivaSort.didAJAX;
        $.each(KivaSort.tables, function(index, table) {
            $(table).DataTable().ajax.reload();
        });
    }

    function fetchData(data, callback, settings) {
        if (KivaSort.didAJAX === undefined) {
            // We only fetch the JSON once, and keep a single copy for all tables
            KivaSort.didAJAX = true;

            // Get json from Kiva API and then once we have it (and have
            // pre-processed it)
            fetchKivaPartners(1);
        }

        // This is called when the AJAX call succeeds to let DataTables know we
        // have the data
        KivaSort.fetchedJSON.done(function () {
            callback(KivaSort.fetchedJSON);
        });
    }

    function fetchKivaPartners(pageNum) {
        if (!pageNum || pageNum < 1) { pageNum = 1; }

        // TODO: add appid
        $.getJSON(apiURL, {'page': pageNum})
        .done(gotKivaPage)
        .fail(jsonFailed);
    }

    function jsonFailed() {
        KivaSort.fetchedJSON.data = [];
        KivaSort.fetchedJSON.resolve();
        $.each(KivaSort.tables, function(index, table) {
            var err_row = $(table).find('td.dataTables_empty').first();
            err_row.html("<span class='error'>Error fetching field partner data from Kiva.org.</span>");

            var link = $.parseHTML("<a href='#' title='Click to retry fetching data from Kiva'>Try again</a>")
            $(link).click(function(e) {
                KivaSort.refreshJSON();
                return false;
            });
            err_row.append(link);
        });
    }

    function gotKivaPage(data) {
        $.extend(KivaSort.fetchedJSON.data, data);
        var curPage = data.paging.page;
        if (data.paging.pages > curPage) {
            // There are more pages of field partners JSON to retrieve
            fetchKivaPartners(curPage + 1);
        } else if (KivaSort.fetchedJSON.data) {
            // We got all of the pages
            preProcessJSON(KivaSort.fetchedJSON.data);
            // DataTables expects the data to be in the "data" property
            KivaSort.fetchedJSON.data = KivaSort.fetchedJSON.data.partners;
            KivaSort.fetchedJSON.resolve();
        }
    }

    /* Do some in-place preprocessing of fetched JSON
    */
    function preProcessJSON(data) {
        data.partners.forEach(function (partner) {
            /* If a numeric column is undefined, sort it as
             * undefinedValue */
            numericColumns.forEach(function (column) {
                if(!$.isNumeric(partner[column])) {
                    partner[column] = undefinedValue;
                }
            });

            // Partners with no yield_portfolio defined
            if (!partner.charges_fees_and_interest) {
                partner.portfolio_yield = 0;
            }

            // Make sure text columns don't include any undefined
            textColumns.forEach(function (column) {
                if(!partner[column]) {
                    partner[column] = '';
                }
            });

            // Get country if available
            // If more than one country for an MFI, use the first one
            partner.country = partner.countries[0].name || partner.countries[0].iso_code;
        });
    }
}(jQuery, document, window));
