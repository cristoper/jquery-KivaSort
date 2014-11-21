// TODO: 'loading...' widget
// TODO: fixed headers
// TODO: resizable columns
// TODO: ajax error handling
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
        table: {
            defaultColumnIdStyle: 'underscore'
        },
        dataset: {
            perPageDefault: 500,
            perPageOptions: [20,50,100,500]
        },
        writers: $.extend(percentWriters(percentColumns), linkWriters(linkColumns), {
            'id': function (record) {
                var idLink = $('<a></a>', {
                    text: record.id,
                    href: partnersURL + record.id
                });
                return idLink[0].outerHTML;
            },
            'loans_posted': function (record) {
                if (record.loans_posted === undefined) {
                    return naText;
                }
                return record.loans_posted.toLocaleString();
            },
            'start_date': function (record) {
                if (record.start_date) {
                    var date = new Date(record.start_date);
                    var dateHTML = $('<time></time>', {
                        datetime: record.start_date,
                        text: date.toLocaleDateString()
                    });
                    return dateHTML[0].outerHTML;
                }
                return naText;
            },
            'total_amount_raised': function (record) {
                if (record.total_amount_raised === undefined) {
                    return naText;
                }
                return '$' + record.total_amount_raised.toLocaleString();
            },
        })
    };

    // meta!
    function percentWriters(percentColumns) {
        var writers = {};
        percentColumns.forEach(function(column) {
            writers[column] = makeWriter(column, undefinedValue, naText);
        });
        return writers;

        function makeWriter (column, undefinedValue, naText) {
            return function (record) {
                if (record[column] == undefinedValue) { return naText; }
                return record[column].toFixed(2) + '%';
            };
        }
    }

    function linkWriters(linkColumns) {
        var writers = {};
        linkColumns.forEach(function(column) {
            var linkAttr = { text: column, href: 'url' };
            writers[column] = makeHTMLWriter(column, undefinedValue, naText, '<a></a>', linkAttr);
        });
        return writers;
    }

    function makeHTMLWriter(column, undefinedValue, naText, tagStr, objAttr) {
        return function (record) {
            // build tag attributes to pass to jQuery()
            var tagAttr = {};
            if (record[column]) {
                for (var attr in objAttr) {
                    var value = objAttr[attr];
                    tagAttr[attr] = record[value];
                    if (value == 'url' && !record.url) {
                        // Don't make a link if there is no URL
                        delete tagAttr[attr];
                    }
                }
                var HTML = $(tagStr, tagAttr);
                return HTML[0].outerHTML;
            }
            return naText;
        };
    }

    // Get list of column names (thead) for the given jquery table element
    // returns an array of strings
    function columnNames(table) {
        return table.find('th').map(function () { 
            var title = $.trim($(this).text())
            return title.replace(/\s/g, '_').toLowerCase()
        }).get()
    }

    // Namespace for plugin state
    var KivaSort = {};

    // Static property to store state of JSON fetching
    // TODO: handle failure of JSON fetch
    KivaSort.fetchedJSON = new $.Deferred();

    // Object to store json
    KivaSort.fetchedJSON.data = {};

    // The jQuery function
    $.fn.makeKivaTable = function(opts) {
        var $el = this;
        initKivaSort(opts);

        return this.each(function() {
            KivaSort.fetchedJSON.done(function () {
                // Apply Dynatable to our table element
                $el.DataTable({
                    data: KivaSort.fetchedJSON.data.partners,
                    columns: $.map(columnNames($el), function(name) {
                        return { data: name }
                    })
                });
            });
        });
    };

    function initKivaSort(opts) {
        if (initKivaSort.didInit === undefined) {
            // Only run if we haven't yet been initialized
            initKivaSort.didInit = true;

            /* Get json from Kiva API and then once we have it (and have processed
             * it), call dynatable on our element.
             */
            fetchKivaPartners(1);

            /* Setup default dynatable configuration
            */
            $.extend(true, defaults, opts);
        }
    }

    function fetchKivaPartners(pageNum) {
        if (!pageNum || pageNum < 1) { pageNum = 1; }

        // TODO: add appid
        $.getJSON(apiURL, {'page': pageNum}).done(gotKivaPage);
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
            KivaSort.fetchedJSON.resolve();
        }
    }

    /* Do some in-place sanitizing of JSON object.
     * This makes it more suitable for passing use with dynatable This is
     * instead of using dynatable's readers (since we are providing the json)
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
