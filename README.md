# nz-data-lists

Utilities for scraping known lists of New Zealand data resources and convert them into a tabular format.

## Usage

### 1. fetch the latest version of a web listing and convert the data to tabular format.

    cd nz-data-lists/listings

Go to each folder and check the `README.md` for instructions. A `links.tsv` file gets generated.

###  2. merge all listing data.

    cd nz-data-lists/merged
    ./merge.js

The `links.tsv` files found in the listings folders get merged. Non-geospatial and geospatial are saved separetely, in `merged-default` and `merged-geo` folders, respectively.

Resources data are saved in a [nedb](https://github.com/louischatriot/nedb) datastore.

Snapshots have been produced with the [electron-screenshot](https://github.com/widged/electron-screenshot) toolkit.

The merged data are intended to be used in an interactive [new zealand data catalog](https://github.com/widged/nz-data-lists).
