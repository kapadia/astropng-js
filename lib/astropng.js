(function() {
  var AstroPNG,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  AstroPNG = (function() {

    function AstroPNG(buffer) {
      this.paeth_predictor = __bind(this.paeth_predictor, this);
      this.filter_paeth = __bind(this.filter_paeth, this);
      this.filter_average = __bind(this.filter_average, this);
      this.filter_up = __bind(this.filter_up, this);
      this.filter_sub = __bind(this.filter_sub, this);
      this.filter_none = __bind(this.filter_none, this);
      this.read_line = __bind(this.read_line, this);
      var chunk;
      this.view = new jDataView(buffer, void 0, void 0, false);
      this.idat_chunks = [];
      this.eof = false;
      this.number_of_ihdr = 0;
      this.number_of_idat = 0;
      this.check_signature();
      this.filters = [this.filter_none, this.filter_sub, this.filter_up, this.filter_average, this.filter_paeth];
      while (!this.eof) {
        chunk = this.read_chunk();
        console.log(chunk);
        switch (chunk.type) {
          case 'IHDR':
            this.read_ihdr(chunk.data);
            break;
          case 'fITS':
            this.read_fits(chunk.data);
            break;
          case 'qANT':
            this.read_quantization_parameters(chunk.data);
            break;
          case 'nANS':
            this.read_nan_locations(chunk.data);
            break;
          case 'IDAT':
            this.read_idat(chunk.data);
        }
      }
      this.chunk_reader = new Inflator({
        chunk: 0,
        index: 2,
        data: this.idat_chunks,
        num_chunks: this.number_of_idat,
        readByte: function() {
          if (this.chunk >= this.data.length) return -1;
          while (this.index >= this.data[this.chunk].length) {
            this.index = 0;
            this.chunk += 1;
            if (this.chunk >= this.num_chunks) return -1;
          }
          this.index += 1;
          return this.data[this.chunk][this.index - 1];
        }
      });
    }

    AstroPNG.to_integer = function(bytes, index) {
      return (bytes[index] << 24) | (bytes[index + 1] << 16) | (bytes[index + 2] << 8) | bytes[index + 3];
    };

    AstroPNG.png_signature = [137, 80, 78, 71, 13, 10, 26, 10];

    AstroPNG.prototype.check_signature = function() {
      var byte, _i, _len, _ref, _results;
      _ref = AstroPNG.png_signature;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        byte = _ref[_i];
        _results.push(this.verify_byte(byte));
      }
      return _results;
    };

    AstroPNG.prototype.verify_byte = function(byte) {
      if (byte !== this.view.getUint8()) throw "PNG signature is not correct";
    };

    AstroPNG.prototype.read_chunk = function() {
      var data, i, length, type;
      length = this.view.getUint32();
      type = this.view.getString(4);
      data = (function() {
        var _results;
        _results = [];
        for (i = 1; 1 <= length ? i <= length : i >= length; 1 <= length ? i++ : i--) {
          _results.push(this.view.getUint8());
        }
        return _results;
      }).call(this);
      if (type === 'IEND') {
        this.eof = true;
        return {
          type: type,
          data: data
        };
      }
      if (data.length !== length) throw "PNG chunk out of bounds";
      this.view.seek(this.view.tell() + 4);
      return {
        type: type,
        data: data
      };
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

    AstroPNG.prototype.read_ihdr = function(data) {
      var allowed_bit_depths, allowed_color_types, index;
      this.number_of_ihdr += 1;
      if (this.number_of_ihdr > 1) throw "PNG contains too many IHDR chunks";
      this.width = AstroPNG.to_integer(data, 0);
      this.height = AstroPNG.to_integer(data, 4);
      allowed_color_types = [0];
      if (allowed_color_types.indexOf(data[9]) < 0) {
        throw "PNG contains an unallowed color type (only supporting grayscale)";
      }
      this.color_type = data[9];
      allowed_bit_depths = [8, 16];
      if (allowed_bit_depths.indexOf(data[8]) < 0) {
        throw "PNG contains an unallowed bit depth (only supporting 8 and 16 bit depths)";
      }
      this.bit_depth = data[8];
      this.shift = this.bit_depth - 8;
      this.param_length = this.bit_depth / 8;
      this.line_length = this.param_length * this.width;
      this.index_offset = this.param_length - 1;
      this.prev_line = (function() {
        var _ref, _results;
        _results = [];
        for (index = 1, _ref = this.line_length; 1 <= _ref ? index <= _ref : index >= _ref; 1 <= _ref ? index++ : index--) {
          _results.push(0);
        }
        return _results;
      }).call(this);
      if (data[10] !== 0) throw "PNG contains an unknown compression method";
      this.compression = data[10];
      if (data[11] !== 0) throw "PNG contains an unknown filter method";
      this.filter_method = data[11];
      if (data[12] !== 0 && data[12] !== 1) {
        throw "PNG contains an unknown interlace method";
      }
      return this.interlace_method = data[12];
    };

    AstroPNG.prototype.read_fits = function(data) {
      var c, card, cards, header, key, value, _i, _j, _len, _len2;
      this.header = {};
      header = "";
      for (_i = 0, _len = data.length; _i < _len; _i++) {
        value = data[_i];
        header += String.fromCharCode(value);
      }
      cards = header.split("\n");
      for (_j = 0, _len2 = cards.length; _j < _len2; _j++) {
        card = cards[_j];
        c = card.split("=");
        if (c.length === 2) {
          key = c[0].replace(/^\s\s*/, '').replace(/\s\s*$/, '');
          value = c[1].replace(/^\s\s*/, '').replace(/\s\s*$/, '');
          this.header[key] = value;
        }
      }
      return console.log(this.header);
    };

    AstroPNG.prototype.read_quantization_parameters = function(data) {};

    AstroPNG.prototype.read_nan_locations = function(data) {};

    AstroPNG.prototype.read_idat = function(data) {
      this.idat_chunks[this.number_of_idat] = data;
      return this.number_of_idat += 1;
    };

    AstroPNG.prototype.read_line = function() {
      var a, a_param, b, c, data, element, filter_code, index, recon_data, _len, _ref;
      a_param = (function() {
        var _ref, _results;
        _results = [];
        for (index = 1, _ref = this.param_length; 1 <= _ref ? index <= _ref : index >= _ref; 1 <= _ref ? index++ : index--) {
          _results.push(0);
        }
        return _results;
      }).call(this);
      filter_code = this.chunk_reader.readByte();
      data = (function() {
        var _ref, _results;
        _results = [];
        for (index = 1, _ref = this.line_length; 1 <= _ref ? index <= _ref : index >= _ref; 1 <= _ref ? index++ : index--) {
          _results.push(this.chunk_reader.readByte());
        }
        return _results;
      }).call(this);
      recon_data = [];
      for (index = 0, _len = data.length; index < _len; index++) {
        element = data[index];
        a = a_param[index % this.param_length];
        b = this.prev_line[index];
        c = (_ref = this.prev_line[index - this.param_length]) != null ? _ref : 0;
        recon_data[index] = this.filters[filter_code](data[index], a, b, c);
        a_param[index % this.param_length] = recon_data[index];
      }
      this.prev_line = recon_data;
      data = (function() {
        var _ref2, _ref3, _results;
        _results = [];
        for (index = 0, _ref2 = this.line_length - 1, _ref3 = this.param_length; 0 <= _ref2 ? index <= _ref2 : index >= _ref2; index += _ref3) {
          _results.push(recon_data[index] << this.shift | recon_data[index + this.index_offset]);
        }
        return _results;
      }).call(this);
      return data;
    };

    AstroPNG.prototype.filter_none = function(x, a, b, c) {
      return x;
    };

    AstroPNG.prototype.filter_sub = function(x, a, b, c) {
      return (x + a) & 0xff;
    };

    AstroPNG.prototype.filter_up = function(x, a, b, c) {
      return (x + b) & 0xff;
    };

    AstroPNG.prototype.filter_average = function(x, a, b, c) {
      return (x + ((a + b) >> 1)) & 0xff;
    };

    AstroPNG.prototype.filter_paeth = function(x, a, b, c) {
      var pr;
      pr = this.paeth_predictor(a, b, c);
      return (x + pr) & 0xff;
    };

    AstroPNG.prototype.paeth_predictor = function(a, b, c) {
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

    return AstroPNG;

  })();

  window.AstroPNG = AstroPNG;

}).call(this);
