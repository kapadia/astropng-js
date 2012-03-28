(function() {
  var AstroPNG,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  AstroPNG = (function() {

    function AstroPNG(buffer) {
      this.paethPredictor = __bind(this.paethPredictor, this);
      this.filterPaeth = __bind(this.filterPaeth, this);
      this.filterAverage = __bind(this.filterAverage, this);
      this.filterUp = __bind(this.filterUp, this);
      this.filterSub = __bind(this.filterSub, this);
      this.filterNone = __bind(this.filterNone, this);
      this.readLine = __bind(this.readLine, this);      this.view = new jDataView(buffer, void 0, void 0, false);
      this.idatChunks = [];
      this.currentLine = 0;
      this.eof = false;
      this.numberOfIHDR = 0;
      this.numberOfIDAT = 0;
      this.checkSignature();
      this.filters = [this.filterNone, this.filterSub, this.filterUp, this.filterAverage, this.filterPaeth];
      while (!this.eof) {
        this.readChunk();
      }
      this.chunkReader = new Inflator({
        chunk: 0,
        index: 2,
        data: this.idatChunks,
        num_chunks: this.numberOfIDAT,
        readByte: function() {
          if (this.chunk >= this.data.length) return -1;
          while (this.index >= this.data[this.chunk].length) {
            this.index = 0;
            this.chunk += 1;
            if (this.chunk >= this.numChunks) return -1;
          }
          this.index += 1;
          return this.data[this.chunk][this.index - 1];
        }
      });
    }

    AstroPNG.toInteger = function(bytes, index) {
      return (bytes[index] << 24) | (bytes[index + 1] << 16) | (bytes[index + 2] << 8) | bytes[index + 3];
    };

    AstroPNG.randomNumberGenerator = function(n) {
      var a, i, m, randomNumbers, seed, temp;
      a = 16807.0;
      m = 2147483647.0;
      seed = 1;
      randomNumbers = [];
      for (i = 0; 0 <= n ? i <= n : i >= n; 0 <= n ? i++ : i--) {
        temp = a * seed;
        seed = temp - m * Math.floor(temp / m);
        randomNumbers.push(seed / m);
      }
      return randomNumbers;
    };

    AstroPNG.pngSignature = [137, 80, 78, 71, 13, 10, 26, 10];

    AstroPNG.prototype.checkSignature = function() {
      var byte, _i, _len, _ref, _results;
      _ref = AstroPNG.pngSignature;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        byte = _ref[_i];
        _results.push(this.verifyByte(byte));
      }
      return _results;
    };

    AstroPNG.prototype.verifyByte = function(byte) {
      if (byte !== this.view.getUint8()) throw "PNG signature is not correct";
    };

    AstroPNG.prototype.readChunk = function() {
      var length, type;
      length = this.view.getUint32();
      type = this.view.getString(4);
      switch (type) {
        case 'IHDR':
          this.readIHDR(length);
          break;
        case 'fITS':
          this.readFitsHeader(length);
          break;
        case 'qANT':
          this.readQuantizationParameters(length);
          break;
        case 'nANS':
          this.readNaNLocations(length);
          break;
        case 'IDAT':
          this.readIDAT(length);
          break;
        case 'IEND':
          this.eof = true;
          return;
      }
      return this.view.seek(this.view.tell() + 4);
    };

    /*
      Read the required IHDR chunk of the PNG.  Sets variables for 
      scanning lines.  Extracts:
       * width
       * height
       * color type
       * bit depth
       * compression
       * filter method
       * interlace method
    */

    AstroPNG.prototype.readIHDR = function(length) {
      var allowedBitDepths, allowedColorTypes, data, i, index;
      this.numberOfIHDR += 1;
      data = (function() {
        var _results;
        _results = [];
        for (i = 1; 1 <= length ? i <= length : i >= length; 1 <= length ? i++ : i--) {
          _results.push(this.view.getUint8());
        }
        return _results;
      }).call(this);
      if (this.numberOfIHDR > 1) throw "PNG contains too many IHDR chunks";
      this.width = AstroPNG.toInteger(data, 0);
      this.height = AstroPNG.toInteger(data, 4);
      allowedColorTypes = [0];
      if (allowedColorTypes.indexOf(data[9]) < 0) {
        throw "PNG contains an unallowed color type (only supporting grayscale)";
      }
      this.colorType = data[9];
      allowedBitDepths = [8, 16];
      if (allowedBitDepths.indexOf(data[8]) < 0) {
        throw "PNG contains an unallowed bit depth (only supporting 8 and 16 bit depths)";
      }
      this.bitDepth = data[8];
      this.shift = this.bitDepth - 8;
      this.paramLength = this.bitDepth / 8;
      this.lineLength = this.paramLength * this.width;
      this.indexOffset = this.paramLength - 1;
      this.prevLine = (function() {
        var _ref, _results;
        _results = [];
        for (index = 1, _ref = this.lineLength; 1 <= _ref ? index <= _ref : index >= _ref; 1 <= _ref ? index++ : index--) {
          _results.push(0);
        }
        return _results;
      }).call(this);
      if (data[10] !== 0) throw "PNG contains an unknown compression method";
      this.compression = data[10];
      if (data[11] !== 0) throw "PNG contains an unknown filter method";
      this.filterMethod = data[11];
      if (data[12] !== 0 && data[12] !== 1) {
        throw "PNG contains an unknown interlace method";
      }
      return this.interlaceMethod = data[12];
    };

    AstroPNG.prototype.readFitsHeader = function(length) {
      var c, card, cards, data, key, value, _i, _len, _results;
      if (length === 0) return;
      data = this.view.getString(length);
      cards = data.split("\n");
      this.header = {};
      _results = [];
      for (_i = 0, _len = cards.length; _i < _len; _i++) {
        card = cards[_i];
        c = card.split("=");
        if (c.length === 2) {
          key = c[0].replace(/['"]/g, '').replace(/^\s*([\S\s]*)\b\s*$/, '$1');
          value = c[1].replace(/['"]/g, '').split("/")[0].replace(/^\s*([\S\s]*)\b\s*$/, '$1');
          _results.push(this.header[key] = value);
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    AstroPNG.prototype.readQuantizationParameters = function(length) {
      var i;
      if (length === 0) return;
      length /= 4;
      this.quantizationParameters = (function() {
        var _results;
        _results = [];
        for (i = 1; 1 <= length ? i <= length : i >= length; 1 <= length ? i++ : i--) {
          _results.push(this.view.getFloat32());
        }
        return _results;
      }).call(this);
      return this.randomNumbers = AstroPNG.randomNumberGenerator(this.width * this.height);
    };

    AstroPNG.prototype.readNaNLocations = function(length) {
      var i, nanLocations;
      if (length === 0) return;
      length /= 2;
      nanLocations = (function() {
        var _results;
        _results = [];
        for (i = 1; 1 <= length ? i <= length : i >= length; 1 <= length ? i++ : i--) {
          _results.push(this.view.getUint16());
        }
        return _results;
      }).call(this);
      length /= 2;
      this.yNaN = nanLocations.slice(0, length);
      return this.xNaN = nanLocations.slice(length);
    };

    AstroPNG.prototype.readIDAT = function(length) {
      var data, i;
      data = (function() {
        var _results;
        _results = [];
        for (i = 1; 1 <= length ? i <= length : i >= length; 1 <= length ? i++ : i--) {
          _results.push(this.view.getUint8());
        }
        return _results;
      }).call(this);
      this.idatChunks[this.numberOfIDAT] = data;
      return this.numberOfIDAT += 1;
    };

    AstroPNG.prototype.readLine = function() {
      var a, aParam, b, c, data, dataInteger, element, filterCode, index, indices, r, reconData, scale, zero, _i, _len, _len2, _ref;
      aParam = (function() {
        var _ref, _results;
        _results = [];
        for (index = 1, _ref = this.paramLength; 1 <= _ref ? index <= _ref : index >= _ref; 1 <= _ref ? index++ : index--) {
          _results.push(0);
        }
        return _results;
      }).call(this);
      filterCode = this.chunkReader.readByte();
      data = (function() {
        var _ref, _results;
        _results = [];
        for (index = 1, _ref = this.lineLength; 1 <= _ref ? index <= _ref : index >= _ref; 1 <= _ref ? index++ : index--) {
          _results.push(this.chunkReader.readByte());
        }
        return _results;
      }).call(this);
      reconData = [];
      for (index = 0, _len = data.length; index < _len; index++) {
        element = data[index];
        a = aParam[index % this.paramLength];
        b = this.prevLine[index];
        c = (_ref = this.prevLine[index - this.paramLength]) != null ? _ref : 0;
        reconData[index] = this.filters[filterCode](data[index], a, b, c);
        aParam[index % this.paramLength] = reconData[index];
      }
      this.prevLine = reconData;
      if (this.quantizationParameters != null) {
        zero = this.quantizationParameters[2 * this.currentLine];
        scale = this.quantizationParameters[2 * this.currentLine + 1];
        r = this.randomNumbers.slice(0, this.width);
        dataInteger = (function() {
          var _ref2, _ref3, _results;
          _results = [];
          for (index = 0, _ref2 = this.lineLength - 1, _ref3 = this.paramLength; 0 <= _ref2 ? index <= _ref2 : index >= _ref2; index += _ref3) {
            _results.push(reconData[index] << this.shift | reconData[index + this.indexOffset]);
          }
          return _results;
        }).call(this);
        data = (function() {
          var _ref2, _results;
          _results = [];
          for (index = 0, _ref2 = dataInteger.length - 1; 0 <= _ref2 ? index <= _ref2 : index >= _ref2; 0 <= _ref2 ? index++ : index--) {
            _results.push((dataInteger[index] - r[index] + 0.5) * scale + zero);
          }
          return _results;
        })();
        this.randomNumbers = this.randomNumbers.slice(this.width);
        indices = [];
        index = this.yNaN.indexOf(this.currentLine);
        while (index !== -1) {
          indices.push(index);
          index = this.yNaN.indexOf(this.currentLine, index + 1);
        }
        for (_i = 0, _len2 = indices.length; _i < _len2; _i++) {
          index = indices[_i];
          data[this.xNaN[index]] = Number.NaN;
        }
      } else {
        data = (function() {
          var _ref2, _ref3, _results;
          _results = [];
          for (index = 0, _ref2 = this.lineLength - 1, _ref3 = this.paramLength; 0 <= _ref2 ? index <= _ref2 : index >= _ref2; index += _ref3) {
            _results.push(reconData[index] << this.shift | reconData[index + this.indexOffset]);
          }
          return _results;
        }).call(this);
      }
      this.currentLine += 1;
      return data;
    };

    AstroPNG.prototype.filterNone = function(x, a, b, c) {
      return x;
    };

    AstroPNG.prototype.filterSub = function(x, a, b, c) {
      return (x + a) & 0xff;
    };

    AstroPNG.prototype.filterUp = function(x, a, b, c) {
      return (x + b) & 0xff;
    };

    AstroPNG.prototype.filterAverage = function(x, a, b, c) {
      return (x + ((a + b) >> 1)) & 0xff;
    };

    AstroPNG.prototype.filterPaeth = function(x, a, b, c) {
      var pr;
      pr = this.paethPredictor(a, b, c);
      return (x + pr) & 0xff;
    };

    AstroPNG.prototype.paethPredictor = function(a, b, c) {
      var p, pa, pb, pc, pr;
      p = a + b - c;
      pa = Math.abs(p - a);
      pb = Math.abs(p - b);
      pc = Math.abs(p - c);
      if (pa <= pb && pa <= pc) {
        pr = a;
      } else if (pb <= pc) {
        pr = b;
      } else {
        pr = c;
      }
      return pr;
    };

    AstroPNG.prototype.readImageData = function() {
      var j, _ref, _results;
      this.imageData = [];
      _results = [];
      for (j = 1, _ref = this.height; 1 <= _ref ? j <= _ref : j >= _ref; 1 <= _ref ? j++ : j--) {
        _results.push(this.imageData = this.imageData.concat(this.readLine()));
      }
      return _results;
    };

    AstroPNG.prototype.computeStatistics = function() {
      var diff2, imageData, pixel, sum, _i, _j, _len, _len2;
      if (!(this.imageData != null)) this.readImageData();
      imageData = (function() {
        var _i, _len, _ref, _results;
        _ref = this.imageData;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          pixel = _ref[_i];
          if (!isNaN(pixel)) _results.push(pixel);
        }
        return _results;
      }).call(this);
      this.minimumPixel = Math.min.apply(Math, imageData);
      this.maximumPixel = Math.max.apply(Math, imageData);
      sum = 0;
      for (_i = 0, _len = imageData.length; _i < _len; _i++) {
        pixel = imageData[_i];
        sum += pixel;
      }
      this.mean = sum / imageData.length;
      diff2 = 0;
      for (_j = 0, _len2 = imageData.length; _j < _len2; _j++) {
        pixel = imageData[_j];
        diff2 += (pixel - this.mean) * (pixel - this.mean);
      }
      diff2 /= imageData.length;
      return this.std = Math.sqrt(diff2);
    };

    AstroPNG.prototype.getIntensity = function(x, y) {
      var index;
      index = this.width * parseInt(y + 0.5) + parseInt(x + 0.5);
      if (index > this.imageData.length) return false;
      return this.imageData[index];
    };

    return AstroPNG;

  })();

  window.AstroPNG = AstroPNG;

}).call(this);
