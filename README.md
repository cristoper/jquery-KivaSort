# KivaSort - A JQuery Plugin

KivaSort is a simple JQuery plugin which uses the [Kiva API](http://build.kiva.org/) to get information on all of the Kiva field partners, and then uses the [DataTables Jquery Plugin](http://www.datatables.net/) to wrap the data in a dynamic sortable and filterable table.

KivaSort makes it easy to add several such tables to a single HTML document (each one pre-sorted and filtered on different criteria, for example).

DataTables does all of the heavy lifting of making the table dynamic. Any of the many [DataTables options](http://datatables.net/reference/option/) may be passed to the KivaSort table, and the rich [DataTables API](http://datatables.net/reference/api/) can be used to programatically manipulate the KivaSort table.

## Installation

The KivaSort plugin is contained in a single JavaScript file, [kiva_sort.js](https://raw.githubusercontent.com/cristoper/jquery-KivaSort/master/js/kiva_sort.js). You can also find the latest stable version in the master branch of [its github repository](https://github.com/cristoper/jquery-KivaSort)

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
  <script type="text/javascript" charset="utf8" src="js/kiva_sort.js"></script>
</head>
```

## Usage

Applying KivaSort to a table requires two simple steps:

1. Create a template HTML table, with the column headings corresponding to the field partner data you wish to display

2. Apply KivaSort to the table using its `.makeKivaTable()` function

### HTML Table Template

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

The following columns are available:

* Average Loan Size Percent Per Capita Income
* Country
* Currency Exchange Loss Rate
* Default Rate
* Delinquency Rate
* Due Diligence Type
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

Once KivaSort is applied to the above table using the following JavaScript, the plugin will fetch the field partner data from the Kiva API and populate the table with sortable column headings:

```javascript
<script type="text/javascript" charset="utf8">
$(document).ready(function () {
    $('.KivaSort').makeKivaTable();
});
</script>
```

That's it!

## License

KivaSort is licensed under the term of the [WTFPL](http://www.wtfpl.net/about/), version 2. See [LICENSE.txt](LICENSE.txt) as included with this project. Note that the libraries in the `js/vendor/` directory are included in the KivaSort repository as a convenience, but they are distributed under their own respective licenses.

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D
