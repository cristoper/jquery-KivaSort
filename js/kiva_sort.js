/** Kiva Sort: Jquery plugin for retrieving and displaying list of Kiva
 * field partners which may be sorted and filtered.
 **/
(function ($) {
    var pluginName = 'KivaSort';
    var apiURL = 'http://api.kivaws.org/v1/partners.json';
    var pageNum = 1;
    var jsonData = {};

    // Utility function to fetch list of partners from Kiva API as JSON
    $[pluginName].fetchKivaPartners = function () {
        if (!pageNum || pageNum < 1) {
            pageNum = 1;
        }

        // TODO: add appid
        $.getJSON(apiURL, {'page': pageNum}, gotPartnersPage);
    }

    // Callback from $.getJSON()
    function gotPartnersPage(data, textStatus, jqXHR) {
        $.extend(jsonData, data);
        jsonData;

        if (data.paging.pages > data.paging.page) {
            // There are more pages of field partners data to retrieve
            pageNum += 1;
            $.fetchKivaPartners();
        }

        // At this point have all the partners in the global jsonData object
    }



//$.fn[pluginName].

}(jQuery));

$(document).ready($.KivaSort.fetchKivaPartners);
$( document ).ajaxComplete(function(event, XMLHttpRequest, ajaxOptions) {
  XMLHttpRequest;
});
