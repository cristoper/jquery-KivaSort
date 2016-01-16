# Change Log
All notable changes to this project will be documented in this file.
This project tries to adhere to [Semantic Versioning](http://semver.org/).

## [Unreleased]
### Fixed
- Switch back to using the `columns.data` option (as opposed to `columns.render` to work around possible DataTables bug
- Improve the way undefined data is treated by the orthogonal data types. This makes better column sorting possible

### Added
- CHANGELOG.md

## [1.1.1] - 2014-08-09
### Fixed
- Improve performance significantly

## [1.1.0] - 2016-01-09
### Added
- Custom buttons for use with DataTables' [Buttons extension](http://datatables.net/extensions/buttons/)
  - "Reload" button fetches fresh data from Kiva and reloads the table
  - "JSON" button displays raw JSON data
  - Can be used just like any of the Buttons extension built-in buttons
- Export `fetchKivaPartners()` as CommonJS module method (for use from Node.js)
  - Include an example node.js script for fetching field partner data (JSON) from the commandline
- `package.json` for installation via [npm](https://www.npmjs.com/package/jquery-kivasort)
- A new `reloadKivaTable()` plugin method which re-fetches the data from Kiva and reloads the entire table

## [1.0.0](https://github.com/cristoper/jquery-KivaSort/releases/tag/v1.0.0) - 2014-12-01
### Initial Release!

- Fetches data from Kiva.org's API
  - Can also use locally provided JSON instead of making an AJAX call
- Displays much of that data (supports a total of 16 columns, any of which may be used) in a sortable, searchable table (based on the [DataTables jQuery plugin](http://datatables.net/)
- Allows passing options to the underlying DataTable, so a KivaSort table can be customized, extended, and themed just like any DataTable.
- Supports multiple tables in a single HTML document
- Installable from 

[Unreleased]: https://github.com/cristoper/jquery-KivaSort/compare/v1.1.1...HEAD
[1.1.1]: https://github.com/cristoper/jquery-KivaSort/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/cristoper/jquery-KivaSort/compare/v1.0.0...v1.1.0
