describe("AstroPNG", function(){
  
  var ap;
  
  beforeEach(function() {
    var imageSource = "iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFEAAAAAD4lKV6AAAFYGZJVFNTSU1QTEUgID0gICAgICAgICAgICAgICAgICAgIFQgLyBjb25mb3JtcyB0byBGSVRTIHN0YW5kYXJkICAgICAgICAgICAgICAgICAgICAgIApCSVRQSVggID0gICAgICAgICAgICAgICAgICAtMzIgLyBhcnJheSBkYXRhIHR5cGUgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIApOQVhJUyAgID0gICAgICAgICAgICAgICAgICAgIDIgLyBudW1iZXIgb2YgYXJyYXkgZGltZW5zaW9ucyAgICAgICAgICAgICAgICAgICAgIApOQVhJUzEgID0gICAgICAgICAgICAgICAgICAgIDUgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIApOQVhJUzIgID0gICAgICAgICAgICAgICAgICAgIDUgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIApDUlBJWDEgID0gICAgICAgICAgICAgICAgICAyLjUgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIApDUlBJWDIgID0gICAgICAgICAgICAgICAgICAyLjUgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIApDUlZBTDEgID0gICAgICAgICAgIDIxMC44MDE4NjggICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIApDUlZBTDIgID0gICAgICAgICAgICA1NC4zNDgxNzEgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIApDRDFfMSAgID0gICAgICAgIC0wLjAwMDI3OTgwOTQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIApDRDFfMiAgID0gICAgICAgICAgMS41NjM2NEUtMDUgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIApDRDJfMSAgID0gICAgICAgICAgMS41NTgyM0UtMDUgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIApDRDJfMiAgID0gICAgICAgICAwLjAwMDI3OTE5MDIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIApDVFlQRTEgID0gJ1JBLS0tVEFOJyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIApDVFlQRTIgID0gJ0RFQy0tVEFOJyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIApDVU5JVDEgID0gJ2RlZyAgICAgJyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIApDVU5JVDIgID0gJ2RlZyAgICAgJyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIO3RcwwAAAAscUFOVAAAAABCJv6QPVR3FD9FEtU+tBiWQF1C8j89zrZAlorzPfz5BTpNKeA/F5uQ+SEuIwAAAABuQU5TF33aHgAAAD1JREFUeJxjYGBgYmf0Zr7LbMXAMIVhDwMDQzaDIAODPoMjQw6Qw8TA0M3AwPifiYHpHJDLIMbQwODHEAUAzSEHuF3psRYAAAAASUVORK5CYII="
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
    expect(ap.width).toEqual(5);
    expect(ap.height).toEqual(5);
    expect(ap.bit_depth).toEqual(16);
  });
  
  it("can read the FITS header", function(){
    header = ap.header;

    expect(header['SIMPLE']).toEqual('T');
    expect(header['BITPIX']).toEqual('-32');
    expect(header['NAXIS']).toEqual('2');
    expect(header['NAXIS1']).toEqual('5');
    expect(header['NAXIS2']).toEqual('5');
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
    var parameters = ap.quantization_parameters;
    var precision = 6;
    
    expect(parameters[0]).toEqual(0);
    expect(parameters[1]).toBeCloseTo(4.17485962e+01, precision);
    expect(parameters[2]).toBeCloseTo(5.18713742e-02, precision);
    expect(parameters[3]).toBeCloseTo(7.69818604e-01, precision);
    expect(parameters[4]).toBeCloseTo(3.51750076e-01, precision);
    expect(parameters[5]).toBeCloseTo(3.45721102e+00, precision);
    expect(parameters[6]).toBeCloseTo(7.41435409e-01, precision);
    expect(parameters[7]).toBeCloseTo(4.70446157e+00, precision);
    expect(parameters[8]).toBeCloseTo(1.23521842e-01, precision);
    expect(parameters[9]).toBeCloseTo(7.82636926e-04, precision);
    expect(parameters[10]).toBeCloseTo(5.92217445e-01, precision);
    
  });

  it("can read the NAN locations", function(){
    
    
    
  });

  // it("can read the image data", function(){
  // });
});
