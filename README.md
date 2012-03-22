astropng-js
========

This is a JavaScript library for reading astronomical data in the PNG format.  We implement three custom PNG chunks to store various metadata.  One chunk stores a complete FITS header, and another two chunks store quantization parameters and NaN locations when float data has been quantized.

Dependencies
------------
Two dependent libraries are needed to use astropng-js: jDataView and deflate.js.

* https://github.com/vjeux/jDataView
* deflate.js is found in test/lib.

Installation
------------
Include the dependent libraries and astropng-js.

    <script src="path/to/jdataview.js" type="text/javascript" charset="utf-8"></script>
    <script src="path/to/deflate.js" type="text/javascript" charset="utf-8"></script>
    <script src="path/to/astropng.js" type="text/javascript" charset="utf-8"></script>

Usage
------------
Using an XMLHttpRequest, retrieve an array buffer or binary string of the AstroPNG.

    var xhr = new XMLHttpRequest();
    xhr.open('GET', "url/to/astro.png", true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function(e) {
        ap = new AstroPNG(xhr.response)
    };
    xhr.send();
    
References
----------
Stoehr, F. et al. 2007, ST-ECF Newsletter. 42, 4.

White, Richard L, Perry Greenfield, William Pence, Nasa Gsfc, Doug Tody, and Rob Seaman. 2011.  Tiled Image Convention for Storing Compressed Images in FITS Binary Tables: 1-17.