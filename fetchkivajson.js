#!/usr/bin/env node
/* This script fetches the list of kiva.org field partners from the kiva API
 * and outputs them, in JSON format, to stdout.
 *
 * Use it like:
 * $ node fetchkivajson.js > partners.json
 *
 * It does this by loading the jquery-kivasort plugin, and executing the same
 * function that plugin uses in the browser. jquery and jsdom are required.
 */

var fs = require("fs");

// Setup a DOM environment to make jQuery happy
const { JSDOM, ResourceLoader } = require('jsdom');

const resourceLoader = new ResourceLoader({
    proxy: "http://127.0.0.1:8888",
    strictSSL: false,
    rejectUnauthorized: false,
});
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>',
    {
        url: "https://api.kivaws.org",
    });

global.document = dom.window.document;
global.window = dom.window;
global.navigator = dom.window.navigator;

jQuery = require('jquery');

/** dummy object so we don't have to require datatables
 * from node.js
 */
jQuery.fn= {dataTable: {ext: {}}};

// load jquery-kivasort plugin
var plugin = require('./kiva_sort.js');

// Fetch data and send it to stdout
plugin.fetchKivaPartners().done(function(data) {
        console.log(JSON.stringify({partners: data}, null, 2));
        });
