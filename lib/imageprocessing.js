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
        vmin += astropng.min * astropng.min;
        vmax += astropng.max * astropng.max;
      }
      vmin = Math.sqrt(vmin / astropngs.length);
      vmax = Math.sqrt(vmax / astropngs.length);
      return [vmin, vmax];
    },
    normalize: function(z, beta) {
      z /= beta;
      return Math.log(z + Math.sqrt(1 + z * z));
    },
    normalizeLupton: function(z, beta, min, max) {
      if (z < min) return 0;
      if (z > max) return 1;
      return this.normalize(z - min, beta) / this.normalize(max - min, beta);
    },
    scale: function(pixel, min, max) {
      return 255 * (pixel - min) / (max - min);
    },
    stretch: function(astropng, vmin, vmax, canvasArray) {
      var data, i, index, length, max, min, numberOfPixels, pixel, _ref;
      numberOfPixels = astropng.imageData.length;
      length = 4 * numberOfPixels;
      data = image.data;
      min = vmin != null ? this.normalize(vmin, this.softening[image.filter]) : this.normalize(image.min, this.softening[image.filter]);
      max = vmax != null ? this.normalize(vmax, this.softening[layer.filter]) : this.normalize(layer.max, this.softening[layer.filter]);
      for (i = 0, _ref = length - 1; i <= _ref; i += 4) {
        index = i / 4;
        pixel = data[index];
        pixel = this.normalize(pixel, this.softening[layer.filter]);
        pixel = this.scale(pixel, min, max);
        canvas_arr[i + 0] = pixel;
        canvas_arr[i + 1] = pixel;
        canvas_arr[i + 2] = pixel;
        canvas_arr[i + 3] = 255;
      }
      return canvas_arr;
    }
  };

  window.ImageProcessing = ImageProcessing;

}).call(this);
