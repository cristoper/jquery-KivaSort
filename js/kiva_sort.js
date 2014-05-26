/** Kiva Sort: Jquery plugin for retrieving and displaying list of Kiva
 * field partners which may be sorted and filtered.
 **/
(function ($) {
    var pluginName = 'KivaSort';
    var apiURL = 'http://api.kivaws.org/v1/partners.json';
    var pageNum = 1;
    var jsonData = {};
    var partnersURL = 'http://kiva.org/partners/';
    var naText = ''; // text to display when a value is N/A

    // Put everything under jQuery in our namespace
    $[pluginName] = {}

    // Utility function to fetch list of partners from Kiva API as JSON
    $[pluginName].fetchKivaPartners = function () {
        if (!pageNum || pageNum < 1) {
            pageNum = 1;
        }

        // TODO: add appid
        $.getJSON(apiURL, {'page': pageNum}, gotPartnersPage);
    }

    // Do some in-place preprocessing of JSON object
    // This makes it more suitable for passing use with dynatable
    // This is instead of using dynatable's readers (since we are providing the json)
    function preProcessJSON(data) {
        data.forEach(function (partner) {

            // Partners with no yield_portfolio defined
            if (!partner.charges_fees_and_interest) {
                partner.portfolio_yield = 0;
            } else if (!partner.portfolio_yield) {
                // sort undefined portfolio yields as high
                partner.portfolio_yield = 999;
            }

            // Partners with no profitability defined
            if (!partner.profitability) {
                partner.profitability= 999;
            }

            // Partners with no delinquency_rate defined
            if (!partner.delinquency_rate ||
                partner.delinquency_rate == 'N/A') {
                    partner.delinquency_rate = 999;
                }

            // Partners with no default_rate defined
            if (!partner.default_rate ||
                partner.default_rate == 'N/A') {
                    partner.default_rate = 999;
                }

            // Get country if available
            // If more than one country for an MFI, use the first one
            partner.country = partner.countries[0].name || partner.countries[0].iso_code;

            Object.keys(partner).forEach(function (prop) {
                switch (prop) {
                    case 'charges_fees_and_interest':
                        break;
                }
            })
        });

        $('#kiva-sort-table').dynatable({
            dataset: {
                records: jsonData.partners
            },
            writers: {
                'id': function (record) {
                    var idLink = $('<a></a>', {
                        text: record.id,
                    href: partnersURL + record.id
                    });
                    return idLink[0].outerHTML;
                },
            'name': function (record) {
                if (record.url) {
                    nameLink = $('<a></a>', {
                        text: record.name,
                        href: record.url
                    });
                    return nameLink[0].outerHTML;
                }
                return record.name;
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
            'portfolio_yield': function (record) {
                if (record.portfolio_yield == 999) {
                    return naText;
                }
                return record.portfolio_yield.toString() + '%';
            },
            'profitability': function (record) {
                if (record.profitability == 999) {
                    return naText;
                }
                return record.profitability.toString() + '%';
            },
            'delinquency_rate': function (record) {
                if (record.delinquency_rate == 999) {
                    return naText;
                }
                return record.delinquency_rate.toFixed(2) + '%';
            },
            'default_rate': function (record) {
                if (record.default_rate == 999) {
                    return naText;
                }
                return record.default_rate.toFixed(2) + '%';
            },
            'total_amount_raised': function (record) {
                if (record.total_amount_raised == undefined) {
                    return naText;
                }
                return '$' + record.total_amount_raised.toLocaleString();
            },
            'loans_posted': function (record) {
                if (record.loans_posted == undefined) {
                    return naText;
                }
                return record.loans_posted.toLocaleString();
            }
            }
        });   

    }

    // Callback from $.getJSON()
    function gotPartnersPage(data, textStatus, jqXHR) {
        $.extend(jsonData, data);

        if (data.paging.pages > data.paging.page) {
            // There are more pages of field partners data to retrieve
            pageNum += 1;
            $.fetchKivaPartners();
        }

        // At this point have all the partners in the global jsonData object
        preProcessJSON(jsonData.partners);
    }



    //$.fn[pluginName].

}(jQuery));

$(document).ready(function () {
    $.KivaSort.fetchKivaPartners();
    $.dynatableSetup({
        table: {
            defaultColumnIdStyle: 'underscore'
        }
    });

});
