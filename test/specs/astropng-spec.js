$(document).ready(function() {

  describe("AstroPNG", function(){
    
    var imageSource = $("#astropng_img").attr("src").split(',')[1]
    var decodedData = window.atob(imageSource);

    var ap = new AstroPNG(decodedData);
    console.log(ap);


    beforeEach(function() {

      // console.log('beforeEach');
      // var xhr = new XMLHttpRequest();
      // xhr.open('GET', "../data/8647474690315911393_g.png", true);
      // xhr.responseType = 'arraybuffer';
      // xhr.onload = function(e) {  
      //   ap = new AstroPNG(xhr.response)
      // };
      // xhr.send();
    });

    it("can read the IHDR chunk", function(){
    });

    it("can read the FITS header", function(){
    });

    it("can read the quantization parameters", function(){
    });

    it("can read the NAN locations", function(){
    });

    it("can read the image data", function(){
    });
  });
    
});

