# KivaSort - A JQuery Plugin

KivaSort (`jquery-kivasort`) is a simple JQuery plugin which uses the [Kiva API](http://build.kiva.org/) to get information on all of the Kiva field partners, and then uses the [DataTables JQuery Plugin](http://www.datatables.net/) to wrap the data in a dynamic sortable and filterable table.

For live examples, see: http://cristoper.github.io/jquery-KivaSort/

KivaSort makes it easy to add several such tables to a single HTML document (each one pre-sorted and filtered on different criteria, for example).

DataTables does all of the heavy lifting of making the table dynamic. Any of the many [DataTables options](http://datatables.net/reference/option/) may be passed to the KivaSort table, the rich [DataTables API](http://datatables.net/reference/api/) can be used to programatically manipulate the KivaSort table, and many read-made plugins are available for DataTables which add useful features to the table (fixed headers, sortable columns, etc.)

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Installation](#installation)
  - [Plain File](#plain-file)
  - [Bower and npm Packages](#bower-and-npm-packages)
  - [Add KivaSort To Your HTML](#add-kivasort-to-your-html)
- [Usage](#usage)
  - [Basic Table](#basic-table)
  - [Column Names and Arbitrary Column Names](#column-names-and-arbitrary-column-names)
  - [Options](#options)
    - [DataTables Options](#datatables-options)
    - [Custom Buttons](#custom-buttons)
  - [Reload a KivaSort Table](#reload-a-kivasort-table)
  - [Remove a KivaSort Table](#remove-a-kivasort-table)
  - [Use as a node.js module](#use-as-a-nodejs-module)
- [License](#license)
- [Contributing](#contributing)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## KivaSort in the Wild

* [KivaSort.org](http://www.kivasort.org/)

## Installation

### Plain File From Git

The KivaSort plugin is contained in a single JavaScript file, [kiva_sort.js](https://raw.githubusercontent.com/cristoper/jquery-KivaSort/master/js/kiva_sort.js). You can find the latest stable version in the master branch of [its github repository](https://github.com/cristoper/jquery-KivaSort). Simply download it then include it in your HTML.

Or a good way to include KivaSort into your project so that it is easy to check for updates is to use [git subtree](https://git-scm.com/book/en/v1/Git-Tools-Subtree-Merging):

```sh
# Add the KivaSort repo as a remote:
$ git remote add kivasort git@github.com:cristoper/jquery-KivaSort.git

# Add the subtree (replace 'vendor/ks' with the directory where
# KivaSort should live):
$ git subtree add -P js/ks --squash kivasort master

# Then to update KivaSort in the future run:
$ git subtree pull -P js/ks --squash kivasort master
```

### Bower and npm Packages

Or, instead of git you can use a package manager. If you use [Bower](http://bower.io/), you can install KivaSort by running:

```sh
bower install jquery-kivasort
```

Likewise if you use [npm](https://www.npmjs.com/) to manage your dependencies, you can install jquery-kivasort by running:

```sh
npm install jquery-kivasort
```

### Add KivaSort To Your HTML

KivaSort has two dependencies which must also be referenced from your HTML document:

* The [JQuery](http://jquery.com/download/) library
* The [DataTables JQuery plugin](http://www.datatables.net/manual/installation)

So your HTML page should have lines similar to these:

```html
<head>
  <!-- DataTables CSS -->
  <link rel="stylesheet" type="text/css" href="//cdn.datatables.net/1.10.4/css/jquery.dataTables.css">

  <!-- JQuery JavaScript -->
  <script type="text/javascript" charset="utf8" src="//cdn.datatables.net/1.10.4/js/jquery.dataTables.js"></script>

  <!-- DataTables JavaScript -->
  <script type="text/javascript" charset="utf8" src="//code.jquery.com/jquery-1.11.0.min.js"></script>

  <!-- KivaSort JavaScript (locally hosted) -->
  <script type="text/javascript" charset="utf8" src="path/to/kiva_sort.js"></script>
</head>
```

## Usage

Applying KivaSort to a table requires two simple steps:

1. Create a template HTML table, with the column headings corresponding to the field partner data you wish to display

2. Apply KivaSort to the table using its `.makeKivaTable()` function

### Basic Table

Below is an example template which will display a table with the five specified columns:

```html
<table id="KivaSort">
    <thead>
        <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Portfolio Yield</th>
            <th>Profitability</th>
            <th>Status</th>
        </tr>
    </thead>
    <tbody>
    </tbody>
</table>
```

See the next section for a complete list of available column names.

Once KivaSort is applied to the above table using the following JavaScript, the plugin will fetch the field partner data from the Kiva API and populate the table with sortable column headings:

```javascript
<script type="text/javascript" charset="utf8">
$(document).ready(function () {
    $('#KivaSort').makeKivaTable();
});
</script>
```

That's it! For some live examples you can play with, see: http://cristoper.github.io/jquery-KivaSort/

### Column Names and Arbitrary Column Names

The following columns are available for use in your template table:

* Average Loan Size Percent Per Capita Income
* Country
* Currency Exchange Loss Rate
* Default Rate
* Delinquency Rate
* ID
* Loans At Risk Rate
* Loans Posted
* Name
* Portfolio Yield
* Profitability
* Rating
* Start Date
* Status
* Total Amount Raised
* URL

Column names are case insensitive, and spaces may be replaced with underscores (so `Loans Posted`, `loans posted` and `loans_posted` will all be populated with the same data when `makeKivaTable()` is applied to the table element).

Arbitrary column names are possible by using the Datatables [columns.name](https://datatables.net/reference/option/columns.name) option.  The [examples page](http://cristoper.github.io/jquery-KivaSort/) includes an example demonstrating the use of the `columns.name` option.

### Options

The `makeKivaSort()` function may be passed an option object. Most options are passed on to the DataTables instance allowing you to fully customize the look and behavior of the table, but KivaSort accepts two options of its own:

* `ks_appID` - the app_id to pass along with all requests to the Kiva API (should be reverse-DNS string). See: http://build.kiva.org/docs/linking_to_kiva/app_id

* `ks_partnerData` - An object containing JSON data just like what the Kiva API returns. When this option is present, KivaSort will not make any API calls, and will instead use the given data as if it came from Kiva.org. This is useful, for example, for using cached data instead of calling the Kiva servers every time.

For example, to include your app_id with all API calls to Kiva, invoke `makeKivaSort()` like this:

```javascript
$(document).ready(function () {
    $('#KivaSort').makeKivaTable({
        ks_appID: 'tld.your.appid'
    });
});
```

#### DataTables Options

To pass any of the DataTables configuration options, simply pass them in the options object to `makeKivaTable()`. The following example passes the `pageLength`, `scrollX`, and `order` DataTables options to change the table behavior. The last line uses the DataTables API to filter out any rows which contain "-" (which is the character KivaSort uses when no data is available for a column).


```javascript
$(document).ready(function () {
    var table = $('#KivaSort');
    table.makeKivaTable({
        pageLength: 5, // Only 5 rows per page
        scrollX: true, // allow horizontal scrollbar

       /* Sort by Portfolio Yield, and then Profitability */
       order: [[2, "desc"], [3, "desc"]]
    });

    /* Filter out rows with no portfolio yield or profitability data */
    table.DataTable().columns('th').search('^(?!-$)', true, false);
});
```

#### Custom Buttons

The [Buttons extension](https://datatables.net/extensions/buttons/) provides many standard buttons for use with datatables (for exporting data, hiding columns, etc.). If the Buttons extension is loaded, then jquery-kivasort provides two custom buttons:

- `json` - opens a new tab/window and displays the partners list in JSON format
- `reload` - forces the table to re-fetch data from Kiva and reload it

Use the buttons just like any of the buttons which come with the Buttons extension:

```javascript
$('#KivaSort').makeKivaTable({
     buttons: ['pageLength', 'reload', 'json'],
     dom: 'Bftip'
});
```

Also check out the "Using Cached Data" example (on the [examples page](http://cristoper.github.io/jquery-KivaSort/)).

### Reload a KivaSort Table

To make a KivaSort table reload its data, use the `reloadKivaTable()` method:

```javascript
$('#KivaSort').reloadKivaTable();
```

### Remove a KivaSort Table

A KivaSort instance may be removed from a table using the `removeKivaTable()` function.  This essentially is the reverse of .makeKivaTable(). It removes the target table(s) from KivaSort.tables array, clears the data, then destroys the table's associated DataTables instance:

```javascript
$('#KivaSort').removeKivaTable();
```

### Use as a node.js module

In addition to being a jquery plugin, KivaSort can be imported as a [node.js](https://nodejs.org/en/) module. It exports a single function, `fetchKivaPartners()`, which asynchronously fetches, cleans up, and returns the list of Kiva field partners from the Kiva web service (in JSON format).

This means KivaSort can be run from the command line to retrieve the Kiva JSON. Toward that end, a very simple node script is included ([`fetchkivajson.js`](https://github.com/cristoper/jquery-KivaSort/blob/dev/fetchkivajson.js)). Run it like this to save the fetched JSON to a file:

```bash
$ ./fetchkivajson.js > partners.json
```

Note that the script requires having the node `jquery` and `jsdom` packages installed. Running `$ npm install` from the project directory will install everything.

## License

KivaSort is licensed under the term of the [WTFPL](http://www.wtfpl.net/about/), version 2. See [LICENSE.txt](LICENSE.txt) as included with this project.

## Contributing

Any contributions are welcome of course! Feel free to use the [project issues tracker](https://github.com/cristoper/jquery-KivaSort/issues) to let me know of any bugs, typos, or feature requests.

If you'd like to contribute code (or documentation) you can either open an issue and attach a patch, or if you use Github:

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request
