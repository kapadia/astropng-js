describe("AstroPNG", function(){
  
  var ap;
  var controlParameters = [4.74645138e+00, 6.40677869e-01, 9.19648933e+00, 3.50437552e-01, 6.68422365e+00, 1.55459598e-01, 3.45721102e+00, 7.64741004e-01, 4.70446157e+00, 4.83958751e-01, 7.82636926e-04, 4.67643142e-01];
  var controlNans = [3, 3, 2, 5];
  
  beforeEach(function() {
    var imageSource = "iVBORw0KGgoAAAANSUhEUgAAAAYAAAAGEAAAAACVN2zXAAAFYGZJVFNTSU1QTEUgID0gICAgICAgICAgICAgICAgICAgIFQgLyBjb25mb3JtcyB0byBGSVRTIHN0YW5kYXJkICAgICAgICAgICAgICAgICAgICAgIApCSVRQSVggID0gICAgICAgICAgICAgICAgICAtMzIgLyBhcnJheSBkYXRhIHR5cGUgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIApOQVhJUyAgID0gICAgICAgICAgICAgICAgICAgIDIgLyBudW1iZXIgb2YgYXJyYXkgZGltZW5zaW9ucyAgICAgICAgICAgICAgICAgICAgIApOQVhJUzEgID0gICAgICAgICAgICAgICAgICAgIDYgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIApOQVhJUzIgID0gICAgICAgICAgICAgICAgICAgIDYgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIApDUlBJWDEgID0gICAgICAgICAgICAgICAgICAyLjUgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIApDUlBJWDIgID0gICAgICAgICAgICAgICAgICAyLjUgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIApDUlZBTDEgID0gICAgICAgICAgIDIxMC44MDE4NjggICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIApDUlZBTDIgID0gICAgICAgICAgICA1NC4zNDgxNzEgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIApDRDFfMSAgID0gICAgICAgIC0wLjAwMDI3OTgwOTQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIApDRDFfMiAgID0gICAgICAgICAgMS41NjM2NEUtMDUgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIApDRDJfMSAgID0gICAgICAgICAgMS41NTgyM0UtMDUgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIApDRDJfMiAgID0gICAgICAgICAwLjAwMDI3OTE5MDIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIApDVFlQRTEgID0gJ1JBLS0tVEFOJyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIApDVFlQRTIgID0gJ0RFQy0tVEFOJyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIApDVU5JVDEgID0gJ2RlZyAgICAgJyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIApDVU5JVDIgID0gJ2RlZyAgICAgJyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGYK3rwAAAAwcUFOVECX4u4/JAN3QRMk0j6zbI1A1eUpPh8wzUBdQvI/Q8YRQJaK8z73yXE6TSngPu9u7B6iW8QAAAAIbkFOUwADAAMAAgAFY3q1WgAAAEtJREFUeJxjYGhjyGdQYmBgyGHQYWC4zlADZC5kiGFYx8BwBsh8yNjPGMCkzcCQwQACjgzBYJqhmaGJYQeDK0MSiCMD1JHEUMSgDwD6bQyJnTTvCgAAAABJRU5ErkJggg=="
    var decodedData = window.atob(imageSource);
    ap = new AstroPNG(decodedData);
    // var xhr = new XMLHttpRequest();
    // xhr.open('GET', "../data/8647474690315911393_g.png", true);
    // xhr.responseType = 'arraybuffer';
    // xhr.onload = function(e) {  
    //   ap = new AstroPNG(xhr.response)
    // };
    // xhr.send();
  });

  it("can read the IHDR chunk", function(){
    expect(ap.width).toEqual(6);
    expect(ap.height).toEqual(6);
    expect(ap.bit_depth).toEqual(16);
  });
  
  it("can read the FITS header", function(){
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
  
  it("can read the quantization parameters", function(){
    var i;
    var parameters = ap.quantization_parameters;
    var precision = 6;
    var num_tiles = 6;
    
    for (i = 0; i < 2*num_tiles; i += 1) {
      expect(parameters[i]).toBeCloseTo(controlParameters[i], precision);
    }
    
  });

  it("can read the NAN locations", function(){
    var i;
    var nans = ap.nan_locations
    
    for (i = 0; i < nans.length; i += 1) {
      expect(nans[i]).toEqual(controlNans[i]);
    }
    
  });

  // it("can read the image data", function(){
  // });
});
