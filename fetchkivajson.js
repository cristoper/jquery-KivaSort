#!/usr/bin/env node

/* This script fetches the list of kiva.org field partners from the kiva API
 * and outputs them, in JSON format, to stdout.
 *
 * Use it like:
 * $ node fetchkivajson.js > partners.json
 *
 * It does this by loading the jquery-kivasort plugin, and executing the same
 * function that plugin uses in the browser. jQuery and jsdom are required.
 */

var fs = require("fs");
var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

// Setup a DOM environment to make jQuery happy
document = require('jsdom').jsdom(undefined);
window = document.defaultView;
jQuery = require('jquery');

/** dummy object so we don't have to require datatables
 * from node.js
 */
jQuery.fn= {dataTable: {ext: {}}};

// load jquery-kivasort plugin
var plugin = require('./kiva_sort.js');

// configure jQuery ajax
jQuery.support.cors = true;
jQuery.ajaxSettings.xhr = function() {
    return new XMLHttpRequest();
};

// Fetch data and send it to stdout
plugin.fetchKivaPartners().done(function(data) {
        console.log({partners: data});
        });

