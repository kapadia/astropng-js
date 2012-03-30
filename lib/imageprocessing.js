(function() {
  var ImageProcessing;

  ImageProcessing = {
    softening: {
      u: 1.4E-10,
      g: 0.9E-10,
      r: 1.2E-10,
      i: 1.8E-10,
      z: 7.4E-10
    },
    getExtremes: function(astropngs) {
      var astropng, vmax, vmin, _i, _len;
      vmin = 0;
      vmax = 0;
      for (_i = 0, _len = astropngs.length; _i < _len; _i++) {
        astropng = astropngs[_i];
        vmin += astropng.minimumPixel * astropng.minimumPixel;
        vmax += astropng.maximumPixel * astropng.maximumPixel;
      }
      vmin = Math.sqrt(vmin / astropngs.length);
      vmax = Math.sqrt(vmax / astropngs.length);
      return [vmin, vmax];
    },
    log10: function(x) {
      return Math.log(x) / Math.log(10);
    },
    arcsinh: function(x) {
      return Math.log(x + Math.sqrt(1 + x * x));
    },
    normalize: function(z, beta, stretch) {
      switch (stretch) {
        case 'log':
          return this.log10(z / 0.05 + 1.0) / this.log10(1.0 / 0.05 + 1.0);
        case 'sqrt':
          return Math.sqrt(z);
        case 'arcsinh':
          z /= beta;
          return this.arcsinh(z / -0.033) / this.arcsinh(1.0 / -0.033);
        case 'power':
          return Math.pow(z, 2);
        default:
          return z;
      }
    },
    normalizeLupton: function(z, beta, min, max) {
      if (z < min) return 0;
      if (z > max) return 1;
      return this.normalize(z - min, beta) / this.normalize(max - min, beta);
    },
    scale: function(pixel, min, range) {
      return (pixel - min) / range;
    },
    scaleToColorSpace: function(pixel) {
      return Math.floor(255 * pixel + 0.5);
    },
    stretch: function(astropng, vmin, vmax, stretchFunction, canvasArr) {
      var i, imageData, index, length, max, min, numberOfPixels, pixel, range, softening, _ref;
      imageData = astropng.imageData;
      softening = this.softening[astropng.header.filter] || 1;
      stretchFunction = stretchFunction != null ? stretchFunction : 'linear';
      numberOfPixels = imageData.length;
      length = 4 * numberOfPixels;
      min = vmin != null ? this.normalize(vmin, softening) : this.normalize(astropng.minimumPixel, softening);
      max = vmax != null ? this.normalize(vmax, softening) : this.normalize(astropng.maximumPixel, softening);
      range = max - min;
      for (i = 0, _ref = length - 1; i <= _ref; i += 4) {
        index = i / 4;
        pixel = this.scale(imageData[index], min, range);
        pixel = this.normalize(pixel, softening, stretchFunction);
        pixel = this.scaleToColorSpace(pixel);
        canvasArr[i + 0] = pixel;
        canvasArr[i + 1] = pixel;
        canvasArr[i + 2] = pixel;
        canvasArr[i + 3] = 255;
      }
      return canvasArr;
    },
    luptonColorComposite: function(astropngs, vmin, vmax, canvasArr) {
      var B, G, R, b, g, i, imageDataB, imageDataG, imageDataR, index, length, maxRGB, normalizedPixel, numberOfPixels, pixel, r, range, softening, _ref, _ref2;
      numberOfPixels = astropngs[0].imageData.length;
      length = 4 * numberOfPixels;
      if (vmin == null) {
        _ref = getExtremes(astropngs), vmin = _ref[0], vmax = _ref[1];
      }
      softening = 1;
      range = vmax - vmin;
      imageDataR = astropngs[0].imageData;
      imageDataG = astropngs[1].imageData;
      imageDataB = astropngs[2].imageData;
      for (i = 0, _ref2 = length - 1; i <= _ref2; i += 4) {
        index = i / 4;
        r = imageDataR[index];
        g = imageDataG[index];
        b = imageDataB[index];
        pixel = Math.sqrt((r * r + g * g + b * b) / 3);
        if (pixel === 0) {
          canvasArr[i + 0] = 0;
          canvasArr[i + 1] = 0;
          canvasArr[i + 2] = 0;
          canvasArr[i + 3] = 255;
        } else {
          normalizedPixel = this.normalizeLupton(pixel, softening, vmin, vmax);
          R = r * normalizedPixel / pixel;
          G = g * normalizedPixel / pixel;
          B = b * normalizedPixel / pixel;
          maxRGB = Math.max(R, G, B);
          if (maxRGB > 1) {
            R = R / maxRGB;
            G = G / maxRGB;
            B = B / maxRGB;
          }
          canvasArr[i + 0] = 255 * R;
          canvasArr[i + 1] = 255 * G;
          canvasArr[i + 2] = 255 * B;
          canvasArr[i + 3] = 255;
        }
      }
      return canvasArr;
    }
  };

  window.ImageProcessing = ImageProcessing;

}).call(this);
