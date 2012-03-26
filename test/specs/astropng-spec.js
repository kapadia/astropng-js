describe("AstroPNG", function(){
  var ap, controlParameters, controlXNans, controlYNans, controlImageData;
  
  beforeEach(function () {
    controlParameters = [4.74645138e+00, 6.40677869e-01, 9.19648933e+00, 3.50437552e-01, 6.68422365e+00, 1.55459598e-01, 3.45721102e+00, 7.64741004e-01, 4.70446157e+00, 4.83958751e-01, 7.82636926e-04, 4.67643142e-01];
    controlXNans = [2, 5];
    controlYNans = [3, 3];
    controlImageData = [
      9.10320816e+01, 7.62198029e+01, 2.62453003e+01,
      4.74645138e+00, 7.36081848e+01, 3.28234215e+01,
      8.46166916e+01, 5.26928787e+01, 9.19648933e+00,
      6.53918991e+01, 4.15999374e+01, 7.01190567e+01,
      3.83415642e+01, 6.68422365e+00, 4.17485962e+01,
      6.86772690e+01, 5.88976631e+01, 9.30436478e+01,
      8.30965347e+01, 3.45721102e+00, Number.NaN,
      5.29700203e+01, 6.71149368e+01, Number.NaN,
      4.70446157e+00, 6.78864746e+01, 6.79296417e+01,
      9.34692917e+01, 3.83502083e+01, 5.19416389e+01,
      7.82636926e-04, 1.31537790e+01, 7.55605316e+01,
      4.58650131e+01, 5.32767220e+01, 2.18959179e+01
    ];

    var imageSource = "iVBORw0KGgoAAAANSUhEUgAAAAYAAAAGEAAAAACVN2zXAAAFYGZJVFNTSU1QTEUgID0gICAgICAgICAgICAgICAgICAgIFQgLyBjb25mb3JtcyB0byBGSVRTIHN0YW5kYXJkICAgICAgICAgICAgICAgICAgICAgIApCSVRQSVggID0gICAgICAgICAgICAgICAgICAtMzIgLyBhcnJheSBkYXRhIHR5cGUgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIApOQVhJUyAgID0gICAgICAgICAgICAgICAgICAgIDIgLyBudW1iZXIgb2YgYXJyYXkgZGltZW5zaW9ucyAgICAgICAgICAgICAgICAgICAgIApOQVhJUzEgID0gICAgICAgICAgICAgICAgICAgIDYgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIApOQVhJUzIgID0gICAgICAgICAgICAgICAgICAgIDYgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIApDUlBJWDEgID0gICAgICAgICAgICAgICAgICAyLjUgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIApDUlBJWDIgID0gICAgICAgICAgICAgICAgICAyLjUgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIApDUlZBTDEgID0gICAgICAgICAgIDIxMC44MDE4NjggICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIApDUlZBTDIgID0gICAgICAgICAgICA1NC4zNDgxNzEgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIApDRDFfMSAgID0gICAgICAgIC0wLjAwMDI3OTgwOTQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIApDRDFfMiAgID0gICAgICAgICAgMS41NjM2NEUtMDUgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIApDRDJfMSAgID0gICAgICAgICAgMS41NTgyM0UtMDUgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIApDRDJfMiAgID0gICAgICAgICAwLjAwMDI3OTE5MDIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIApDVFlQRTEgID0gJ1JBLS0tVEFOJyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIApDVFlQRTIgID0gJ0RFQy0tVEFOJyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIApDVU5JVDEgID0gJ2RlZyAgICAgJyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIApDVU5JVDIgID0gJ2RlZyAgICAgJyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGYK3rwAAAAwcUFOVECX4u4/JAN3QRMk0j6zbI1A1eUpPh8wzUBdQvI/Q8YRQJaK8z73yXE6TSngPu9u7B6iW8QAAAAIbkFOUwADAAMAAgAFY3q1WgAAAEtJREFUeJxjYGhjyGdQYmBgyGHQYWC4zlADZC5kiGFYx8BwBsh8yNjPGMCkzcCQwQACjgzBYJqhmaGJYQeDK0MSiCMD1JHEUMSgDwD6bQyJnTTvCgAAAABJRU5ErkJggg=="
    var decodedData = window.atob(imageSource);
    ap = new AstroPNG(decodedData);
    
    this.addMatchers({  
        toBeBetween: function (rangeFloor, rangeCeiling) {  
            if (rangeFloor > rangeCeiling) {  
                var temp = rangeFloor;  
                rangeFloor = rangeCeiling;  
                rangeCeiling = temp;  
            }  
            return this.actual > rangeFloor && this.actual < rangeCeiling;  
        }  
    });
  });

  it("can read the IHDR chunk", function() {
    expect(ap.width).toEqual(6);
    expect(ap.height).toEqual(6);
    expect(ap.bit_depth).toEqual(16);
  });
  
  it("can read the FITS header", function() {
    header = ap.header;

    expect(header['SIMPLE']).toEqual('T');
    expect(header['BITPIX']).toEqual('-32');
    expect(header['NAXIS']).toEqual('2');
    expect(header['NAXIS1']).toEqual('6');
    expect(header['NAXIS2']).toEqual('6');
    expect(header['CRPIX1']).toEqual('2.5');
    expect(header['CRPIX2']).toEqual('2.5');
    expect(header['CRVAL1']).toEqual('210.801868');
    expect(header['CRVAL2']).toEqual('54.348171');
    expect(header['CD1_1']).toEqual('-0.0002798094');
    expect(header['CD1_2']).toEqual('1.56364E-05');
    expect(header['CD2_1']).toEqual('1.55823E-05');
    expect(header['CD2_2']).toEqual('0.0002791902');
    expect(header['CTYPE1']).toEqual('RA---TAN');
    expect(header['CTYPE2']).toEqual('DEC--TAN');
    expect(header['CUNIT1']).toEqual('deg');
    expect(header['CUNIT2']).toEqual('deg');
  });
  
  it("can read the quantization parameters", function() {
    var i;
    var parameters = ap.quantization_parameters;
    var precision = 6;
    var num_tiles = 6;
    
    for (i = 0; i < 2*num_tiles; i += 1)
      expect(parameters[i]).toBeCloseTo(controlParameters[i], precision);
  });

  it("can read the NAN locations", function() {
    var i;
    var x_nans = ap.x_nan;
    var y_nans = ap.y_nan;
    
    for (i = 0; i < x_nans.length; i += 1)
      expect(x_nans[i]).toEqual(controlXNans[i]);
      expect(y_nans[i]).toEqual(controlYNans[i]);
  });

  it("can read line by line of float image data", function() {
    var i, j, row, index;    
    var tolerance = 0.5;
    
    for (j = 0; j < ap.height; j += 1) {
      row = ap.read_line();
      for (i = 0; i < ap.width; i += 1) {
        index = j * ap.width + i;
        if (isNaN(controlImageData[index])) {
          expect(isNaN(row[i])).toBeTruthy();
        } else {
          expect(row[i]).toBeBetween(controlImageData[index] - tolerance, controlImageData[index] + tolerance);
        }
      }
    }
  });
  
  it("can read all float image data", function() {
    var i;
    var tolerance = 0.5;
    
    ap.read_image_data();
    for (i = 0; i < ap.image_data.length; i += 1) {
      if (isNaN(controlImageData[i])) {
        expect(isNaN(ap.image_data[i])).toBeTruthy();
      } else {
        expect(ap.image_data[i]).toBeBetween(controlImageData[i] - tolerance, controlImageData[i] + tolerance);
      }
    }
  });
  
  it("can compute image statistics", function() {
    var tolerance = 0.5;
    var precision = 6;
    
    ap.compute_statistics();
    expect(ap.minimum_pixel).toBeBetween(0.00078263693 - tolerance, 0.00078263693 + tolerance);
    expect(ap.maximum_pixel).toBeBetween(93.469292 - tolerance, 93.469292 + tolerance);
    expect(ap.mean).toBeBetween(49.304658777573529 - tolerance, 49.304658777573529 + tolerance);
    expect(ap.std).toBeBetween(28.376188349694765 - tolerance, 28.376188349694765 + tolerance);
  });
  
  
  
});
