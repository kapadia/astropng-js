describe("AstroPNG", function(){
  
  var ap;
  
  beforeEach(function() {
    var imageSource = "iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFEAAAAAD4lKV6AAAFYGZJVFNTSU1QTEUgID0gICAgICAgICAgICAgICAgICAgIFQgLyBjb25mb3JtcyB0byBGSVRTIHN0YW5kYXJkICAgICAgICAgICAgICAgICAgICAgIApCSVRQSVggID0gICAgICAgICAgICAgICAgICAtMzIgLyBhcnJheSBkYXRhIHR5cGUgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIApOQVhJUyAgID0gICAgICAgICAgICAgICAgICAgIDIgLyBudW1iZXIgb2YgYXJyYXkgZGltZW5zaW9ucyAgICAgICAgICAgICAgICAgICAgIApOQVhJUzEgID0gICAgICAgICAgICAgICAgICAgIDUgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIApOQVhJUzIgID0gICAgICAgICAgICAgICAgICAgIDUgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIApDUlBJWDEgID0gICAgICAgICAgICAgICAgICAyLjUgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIApDUlBJWDIgID0gICAgICAgICAgICAgICAgICAyLjUgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIApDUlZBTDEgID0gICAgICAgICAgIDIxMC44MDE4NjggICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIApDUlZBTDIgID0gICAgICAgICAgICA1NC4zNDgxNzEgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIApDRDFfMSAgID0gICAgICAgIC0wLjAwMDI3OTgwOTQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIApDRDFfMiAgID0gICAgICAgICAgMS41NjM2NEUtMDUgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIApDRDJfMSAgID0gICAgICAgICAgMS41NTgyM0UtMDUgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIApDRDJfMiAgID0gICAgICAgICAwLjAwMDI3OTE5MDIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIApDVFlQRTEgID0gJ1JBLS0tVEFOJyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIApDVFlQRTIgID0gJ0RFQy0tVEFOJyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIApDVU5JVDEgID0gJ2RlZyAgICAgJyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIApDVU5JVDIgID0gJ2RlZyAgICAgJyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIO3RcwwAAAAscUFOVAAAAAA+xVVFOtpaQD4EQzs6BneMPoo+ujhq1eY8/gFIN81miT8Jc8E7ogWseRCZ6QAAAABuQU5TF33aHgAAADxJREFUeJxjYNjKwMCwizGfMYWBaTNbBuMaRh2ggDobA4NOO9sJo9UMdpscpOVXawUCRRkiGXyBpC6DDwAyyAp8pUlFhgAAAABJRU5ErkJggg=="
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
  
  // it("can read the quantization parameters", function(){
  // });
  // 
  // it("can read the NAN locations", function(){
  // });
  // 
  // it("can read the image data", function(){
  // });
});
