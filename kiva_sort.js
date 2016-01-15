/**
* @file KivaSort is a jQuery plugin which makes it easy to include a sortable
* table of Kiva.org's field partners in an HTML document. All the heavy
* lifting is done by the DataTables plugin (http://datatables.net/).
* @author Chris Burkhardt <chris@mretc.net>
*/

/**
* @module jquery-kivasort
* @requires jquery
* @requires datatables
*/

;(function ($, document, window, exports) {
    "use strict";

    var partnersURL = 'http://www.kiva.org/partners/';    
    var apiURL = 'http://api.kivaws.org/v1/partners.json';
    var undefinedValue = 999;
    var naText = '-'; // text to display when a value is N/A
    var numericColumns = ['average_loan_size_percent_per_capita_income', 'currency_exchange_loss_rate', 'default_rate', 'delinquency_rate', 'id', 'loans_at_risk_rate', 'loans_posted', 'portfolio_yield', 'profitability', 'total_amount_raised']; 
    var percentColumns = [ 'average_loan_size_percent_per_capita_income', 'currency_exchange_loss_rate', 'default_rate', 'delinquency_rate', 'loans_at_risk_rate', 'portfolio_yield', 'profitability'];
    var textColumns = ['due_diligence_type', 'name', 'rating', 'status', 'url'];
    var linkColumns = ['name', 'url'];

    /******** DataTables Setup ********/

    // The DataTables defaults
    var defaults = {
        ajax: fetchData,
        columnDefs: [{
            targets: "_all",

            /* I am using the columns.data option instead of columns.render because
             * using columns.render was throwing an error when I tried to invoke
             * column.data() in one of my apps. The exact same function using
             * column.render works... TODO: make a simple test case and determine if it
             * is my bug or DataTables'.
             */
            data: getData
        }]
    };

    /** This is the function DataTables calls when it needs data for a cell.
     * Providing this function allows us to format some data nicely for display
     * and filtering (links, percentages, etc) while leaving the raw data for
     * sorting.  @memberof module:jquery-kivasort
     *
     * @returns {String} - The text (HTML) to display for the requested cell
     * @see http://datatables.net/reference/option/columns.data
     */
    function getData(row, type, set, meta ) {
        // This is too slow!:
        //var api = new $.fn.dataTable.Api(meta.settings);
        //var table = api.table().node()

        /* So instead we must unfortunately rely on the private API of the
         * settings object: */
        var table = meta.settings.nTable;
        var colName = table.columns[meta.col];
        var field = row[colName];

        // Handle all the undefined fields
        if (field === undefined || field == undefinedValue) {
            if (type == "sort") {
                // special value for sorting
                return undefinedValue;
            } else {
                return naText;
            }
        }

        if (type !== "display") {
            // For sorting, filtering, and type detection, return the raw JSON
            // data
            return field;
        }

        // For display format things nicely...

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

    /** A helper function for outputting HTML links
     * @memberof module:jquery-kivasort
     * @param {Object} record - The record (row) containing the text and URL
     * @param {String} column - The column from which the link text should be
     *   taken (ex: "name")
     *
     * @returns {String} HTML for link
     */
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

    /** Get list of column names (thead) for the given JQuery table element
     * @memberof module:jquery-kivasort
     *
     * @param {jQuery} table - The table element from which to
     * collect column names
     *
     * @returns {String[]} An array of strings; each element is a column name, in
     * order
     */
    function columnNames(table) {
        return table.find('th').map(function () { 
            var title = $(this).data('title') || $.trim($(this).text());
            return title.replace(/\s/g, '_').toLowerCase();
        }).get();
    }

    /******** Custom DataTables buttons  ********/

    if (typeof $.fn.dataTable.ext.buttons !== 'undefined') {

        /** A simple button to show the raw JSON data */
        $.fn.dataTable.ext.buttons.json = {
            className: 'buttons-json buttons-html5',
            available: function () {
                return window.Blob;
            },
            text: 'JSON',
            action: function ( e, dt, button, config ) {
                // Set the text
                var output = KivaSort.fetchedJSON.data;
                var json = JSON.stringify({ partners: output });
                var blob = new Blob([json],
                                    {type : 'application/json'});
                                    var url = URL.createObjectURL(blob);
                                    window.open(url);
            }
        };

        /** A Refresh button to force fetching up-to-date json from kiva API */
        $.fn.dataTable.ext.buttons.reload = {
            className: 'buttons-reload',
            text: 'Reload',
            action: function ( e, dt, button, config ) {
                var kTable = dt.table().node();

                // Unset current data to force ajax update
                kTable.opts.ks_partnerData = null;

                $(kTable).reloadKivaTable();
            }
        };
    }

    /******** Main Plugin Functions ********/

    /** Namespace for global plugin state
     *  (The ajax Deferred and data objects are shared between all KivaSort
     *  tables)
     */
    var KivaSort = {};

    /** KivaSort.tables is a global array of each table element (not jquery
     * object) the plugin is applied to */
    KivaSort.tables = [];

    /** Static property to store state of JSON fetching */
    KivaSort.fetchedJSON = new $.Deferred();

    /** Object to store json */
    KivaSort.fetchedJSON.data = {};

    /** The jQuery function to apply KivaSort to table elements. This is
     * KivaSort's main function and should be called from within the
     * $(document).ready() callback. For example (assuming the target table
     * has its id attribute set to 'KivaSort'):
     *
     * $(document).ready(function () {
     *   $('#KivaSort').makeKivaTable();
     * });
     *
     * @memberof module:jquery-kivasort
     *
     * @param {Object} opts - An object containing the KivaSort configuration
     * options. There are only two options specific to KivaSort, the rest will
     * be passed to the DataTables instance applied to the target table(s) (see
     * http://datatables.net/reference/option/)
     *
     * The two KivaSort options which may be passed are:
     *   
     *   * 'ks_appID' - the app_id to pass along with all requests to the
     *     Kiva API (should be reverse-DNS string). See:
     *     http://build.kiva.org/docs/linking_to_kiva/app_id
     *
     *   * 'ks_partnerData' - An object containing JSON data just like what
     *     the Kiva API returns. When this option is present, KivaSort will not
     *     make any API calls, and will instead use the given data as if it
     *     came from Kiva.org. This is useful, for example, for using cached
     *     data instead of calling the Kiva servers every time.
     *
     * @returns {jQuery} A JQuery object wrapping each of the table elements so
     * that further JQuery functions may be chained after .makeKivaTable()
     */
    $.fn.makeKivaTable = function(opts) {
        var opts = opts || {};

        // Get global app_id, if it was passed in opts
        KivaSort.app_id = opts.ks_appID;

        // Add to the global list of tables
        $.merge(KivaSort.tables, this);

        return this.filter('table').each(function(index, table) {
            var $table = $(table);

            // merge the user-provided options for DataTables with our defaults
            var optsColumnDefs = opts.columnDefs;
            if (optsColumnDefs == undefined) {optsColumnDefs = []; }
            // first merge arrays into defaults and remove from opts
            $.merge(defaults.columnDefs, optsColumnDefs);
            delete opts.columnDefs;
            // then extend objects
            table.opts = {};
            $.extend(true, table.opts, defaults, opts);

            /* Get the column names from the bare-bones HTML table provided by the
             * user */
            table.columns = columnNames($(table));

            // Apply DataTables to our table element
            $(table).DataTable(table.opts);
        });
    };

    /** JQuery function to reload a table */
    $.fn.reloadKivaTable = function() {
        delete KivaSort.didAJAX;
        KivaSort.fetchedJSON = new $.Deferred();
        KivaSort.fetchedJSON.data = {};

        return this.each(function(index, el) {
            var dTable = $(this).DataTable();
            dTable.clear().draw();
            dTable.ajax.reload();
        });

    }

    /** JQuery function to remove KivaSort from target table elements
     *
     * This essentially is the reverse of .makeKivaTable(). It removes the
     * target table(s) from KivaSort.tables array, clears the data, then
     * destroys the table's associated DataTables instance.
     */
    $.fn.removeKivaTable = function() {
        return this.each(function(index, table) {
            // remove from KivaSort.tables
            KivaSort.tables = $.grep(KivaSort.tables, function(t) {
                return t != table;
            });
            $(table).DataTable().clear().destroy();
        });
    }

    /******** AJAX Functions ********/

    /** This is the function DataTables calls to get its data.
     * @memberof module:jquery-kivasort
     *
     * @see http://datatables.net/reference/option/ajax
     */
    function fetchData(data, callback, settings) {
        var api = new $.fn.dataTable.Api(settings);
        var table = api.table().node();

        if (table.opts.ks_partnerData) {
            /* We were given data directly for this table, no need to make API
             * call */
            preProcessJSON(table.opts.ks_partnerData);
            KivaSort.fetchedJSON.data = table.opts.ks_partnerData.partners;
            callback(KivaSort.fetchedJSON);
        } else if (KivaSort.didAJAX === undefined) {
            // We only fetch the JSON once, and keep a single copy for all tables
            KivaSort.didAJAX = true;

            // Get json from Kiva API and then once we have it (and have
            // pre-processed it)
            fetchKivaPartners(1);
        }

        /** This is called when the AJAX call succeeds to let DataTables know
         * we have the data (datatables expect the data to be in the 'data'
         * property of the argument */
        KivaSort.fetchedJSON.done(function(json) {
            callback({data: json});
        });
    }

    /** Initiate the AJAX call 
     *  @returns A jquery promise. Calling done() on the promise will return the
     *  data when it is available*/
    function fetchKivaPartners(pageNum) {
        if (!pageNum || pageNum < 1) { pageNum = 1; }

        $.getJSON(apiURL, {'page': pageNum, 'app_id': KivaSort.app_id})
        .done(gotKivaPage)
        .fail(jsonFailed);

        return KivaSort.fetchedJSON;
    }

    /** This is called when the AJAX request fails
     * @memberof module:jquery-kivasort
     */
    function jsonFailed(jqXHR, textStatus, errorThrown) {
        KivaSort.fetchedJSON.data = [];
        KivaSort.fetchedJSON.reject();
        if (typeof exports !== 'undefined') {
            // We were called from a non-browser environment (like node.js)
            console.log('Error fetching JSON: ' + textStatus);
        }
        $.each(KivaSort.tables, function(index, table) {
            var err_row = $(table).find('td.dataTables_empty').first();
            err_row.html("<span class='error'>Error fetching field partner data from Kiva.org.</span>");

            var link = $.parseHTML("<a href='#' title='Click to retry fetching data from Kiva'>Try again</a>")
            $(link).click(function(e) {
                $(table).reloadKivaTable();
                return false;
            });
            err_row.append(link);
        });
    }

    /** This is called on each page of data retrieved from the Kiva API. It
     * then initiates the fetch of the next page until we have all of the data
     * @memberof module:jquery-kivasort
     *
     * @param {JSON} data - The data returned from the server
     * */
    function gotKivaPage(data) {
        $.extend(KivaSort.fetchedJSON.data, data);
        var curPage = data.paging.page;
        if (data.paging.pages > curPage) {
            // There are more pages of field partners JSON to retrieve
            KivaSort.fetchKivaPartners(curPage + 1);
        } else if (KivaSort.fetchedJSON.data) {
            // We got all of the pages
            preProcessJSON(KivaSort.fetchedJSON.data);
            KivaSort.fetchedJSON.resolve(KivaSort.fetchedJSON.data.partners);
        }
    }

    /** Do some in-place preprocessing of fetched JSON
     * @memberof module:jquery-kivasort
     *
     * @param {JSON} data - A JSON object to clean up
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

    /** Export functions for use from non-browser environments (Like node.js)
     * @memberof module:jquery-kivasort
     */
    if (typeof exports !== 'undefined') {
        exports.fetchKivaPartners = fetchKivaPartners;
    }
}(jQuery, document, window, typeof exports === 'undefined' ? undefined : exports));
