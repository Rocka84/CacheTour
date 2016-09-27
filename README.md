CacheTour
=========

Collect Geocaches from geocaching.com and download them as single GPX file.
Inspired by GCtour.

Installation:
-------------
This script needs Tampermonkey in Chrome or Greasemonkey in Firefox - please
install one of them first, if you haven't already.

To install the script, just visit the following link and click install:

https://github.com/Rocka84/CacheTour/raw/master/dist/CacheTour.user.js

Features:
---------
* Manage multiple tours
* add geocaches from the map and details pages to
* reorder / remove caches
* Retrieve cache details and download tour as GPX file
* Multilingual (en, de, more to come)

This script is still very young and still needs some love! If you find bugs or
miss features, please report an [issue on github](https://github.com/Rocka84/CacheTour/issues).
Or even better: fork this repo, make your changes and do a pull request.

Development:
============
Just some quick notes:
You'll need grunt to "compile" the sources to a single .user.js file:
* install nodejs
* install grunt-cli
* run `npm install`
* while developing, run `grunt watch`

For easier development:
In Firefox/Greasemonkey: install the script, look for the file in your profile
folder and replace it with a sym-link to your development version.
In Chrom(ium)/Tampermonkey: Go to Settings -> Extension and allow local file access
for Tampermonkey, then run `grunt create_dev_header` and install dist/cachetour.dev_header.user.js.
 
