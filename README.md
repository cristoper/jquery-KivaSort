# KivaSort - A JQuery Plugin

KivaSort is a simple JQuery plugin which uses the [Kiva API](http://build.kiva.org/) to get information on all of the Kiva field partners, and then uses the [DataTables JQuery Plugin](http://www.datatables.net/) to wrap the data in a dynamic sortable and filterable table.

For live examples, see: http://cristoper.github.io/jquery-KivaSort/

KivaSort makes it easy to add several such tables to a single HTML document (each one pre-sorted and filtered on different criteria, for example).

DataTables does all of the heavy lifting of making the table dynamic. Any of the many [DataTables options](http://datatables.net/reference/option/) may be passed to the KivaSort table, and the rich [DataTables API](http://datatables.net/reference/api/) can be used to programatically manipulate the KivaSort table.

* [KivaSort in the Wild](#kivasort-in-the-wild)
* [Installation](#installation)
* [Usage](#usage)
    * [Basic Table](#basic-table)
    * [Column Names and Arbitrary Column Names](#column-names-and-arbitrary-column-names)
    * [Options](#options)
        * [DataTables Options](#datatables-options)
    * [Remove KivaSort](#remove-kivasort)
* [License](#license)
* [Contributing](#contributing)

## KivaSort in the Wild

* [KivaSort.org](http://www.kivasort.org/)

## Installation

### Plain File

The KivaSort plugin is contained in a single JavaScript file, [kiva_sort.js](https://raw.githubusercontent.com/cristoper/jquery-KivaSort/master/js/kiva_sort.js). You can find the latest stable version in the master branch of [its github repository](https://github.com/cristoper/jquery-KivaSort)

### Bower and npm Packages

If you use [Bower](http://bower.io/) to manage your project dependencies, you can install KivaSort by running:

```sh
bower install jquery-kivasort
```

Likewise if you use [npm](https://www.npmjs.com/) to manage your dependencies, you can install jquery-kivasort by running:

```sh
npm install jquery-kivasort
```

If you don't use bower or npm, just download the `kiva_sort.js` file from Github.

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

Arbitrary column names are possible by adding a `data-title` attribute to the `<th>` element containing one of the valid column names (as listed above), and the human-readable contents of the `<th>` tag may be anything.

For example, this table would be populated with the same data as the first example but with two arbitrary column names:

```html
<table id="KivaSort">
    <thead>
        <tr>
            <th>ID</th>
            <th data-title='name'>Field Partner</th>
            <th data-title='portfolio_yield'>Portfolio Yield (interest)</th>
            <th>Profitability</th>
            <th>Status</th>
        </tr>
    </thead>
    <tbody>
    </tbody>
</table>
```

### Options

The `makeKivaSort()` function may be passed an option object. Most options are passed on to the DataTables instance, but KivaSort accepts two options of its own:

* `ks_appID` - the app_id to pass along with all requests to the Kiva API (should be reverse-DNS string). See: http://build.kiva.org/docs/linking_to_kiva/app_id

* `ks_partnerData` - An object containing JSON data just like what the Kiva API returns. When this option is present, KivaSort will not make any API calls, and will instead use the given data as if it came from Kiva.org. This is useful, for example, for using cached data instead of calling the Kiva servers every time.

For example, to include your app_id with all API calls to Kiva, invoke `makeKivaSort()` like this:

```javascript
$(document).ready(function () {
    $('#KivaSort').makeKivaTable({ks_appID: 'tld.your.appid'});
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

### Remove KivaSort

A KivaSort instance may be removed from a table using the `removeKivaTable()` function.  This essentially is the reverse of .makeKivaTable(). It removes the target table(s) from KivaSort.tables array, clears the data, then destroys the table's associated DataTables instance:

```javascript
$('#KivaSort').removeKivaTable();
```

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
