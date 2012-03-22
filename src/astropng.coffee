
class AstroPNG
  
  constructor: (buffer) ->
    @view = new jDataView buffer, undefined, undefined, false
    @idat_chunks = []
    
    # Variables to help check PNG format
    @eof = false
    @number_of_ihdr = 0
    @number_of_idat = 0
    
    @check_signature()

    # Set up filtering related variables
    @filters = [@filter_none, @filter_sub, @filter_up, @filter_average, @filter_paeth]

    while !@eof
      @read_chunk()

    # Initialize a decompressor for IDAT
    @chunk_reader = new Inflator ({
       chunk: 0,
       index: 2,
       data: @idat_chunks,
       num_chunks: @number_of_idat
       readByte: () ->
         if @chunk >= @data.length
           return -1
         while (@index >= @data[this.chunk].length)
           @index = 0
           @chunk += 1
           if (@chunk >= @num_chunks)
             return -1
         @index += 1
         return @data[@chunk][@index - 1]
    })
  
  # Convert bytes to an integer
  @to_integer: (bytes, index) ->
    return (bytes[index] << 24) | (bytes[index + 1] << 16) | (bytes[index + 2] << 8) | bytes[index + 3]

  # Verify PNG signature
  @png_signature: [137, 80, 78, 71, 13, 10, 26, 10]
  check_signature: -> @verify_byte(byte) for byte in AstroPNG.png_signature
  verify_byte: (byte) ->
    throw "PNG signature is not correct" unless byte is @view.getUint8()
  
  # Read a PNG chunk, determines the length and type, and extracts the data
  read_chunk: ->
    length = @view.getUint32()
    type = @view.getString(4)
    
    console.log length, type
    
    switch type
      when 'IHDR'
        @read_ihdr length
      when 'fITS'
        @read_fits_header length
      when 'qANT'
        @read_quantization_parameters length
      when 'nANS'
        @read_nan_locations length
      when 'IDAT'
        @read_idat length
      when 'IEND'
        @eof = true
        return
    
    # Forward to the next chunk
    @view.seek(@view.tell() + 4)

  ###
  Read the required IHDR chunk of the PNG.  Sets variables for 
  scanning lines.  Extracts:
   * width
   * height
   * color type
   * bit depth
   * compression
   * filter method
   * interlace method
  ###
  read_ihdr: (length) ->
    @number_of_ihdr += 1
    
    data = (@view.getUint8() for i in [1..length])

    # Check if the number of IHDR chunks exceeds one
    throw "PNG contains too many IHDR chunks" if @number_of_ihdr > 1

    @width = AstroPNG.to_integer data, 0
    @height = AstroPNG.to_integer data, 4

    # Check the color type (only supporting grayscale for now)
    allowed_color_types = [0]
    throw "PNG contains an unallowed color type (only supporting grayscale)" if allowed_color_types.indexOf(data[9]) < 0
    @color_type = data[9]

    # Check the bit depth based on the color type (only support 8 and 16)
    allowed_bit_depths = [8, 16]
    throw "PNG contains an unallowed bit depth (only supporting 8 and 16 bit depths)" if allowed_bit_depths.indexOf(data[8]) < 0
    @bit_depth = data[8]

    # Define data relavant to bit depth needed to scan lines
    @shift = @bit_depth - 8
    @param_length = (@bit_depth / 8)
    @line_length = @param_length * @width
    @index_offset = @param_length - 1
    
    # Initialize previous line with zeros
    @prev_line = (0 for index in [1..@line_length])
    
    # Check the compression method
    throw "PNG contains an unknown compression method" if data[10] != 0
    @compression = data[10]

    # Check the filter method
    throw "PNG contains an unknown filter method" if data[11] != 0
    @filter_method = data[11]
    
    # Check the interlace method
    throw "PNG contains an unknown interlace method" if data[12] != 0 and data[12] != 1
    @interlace_method = data[12]
  
  # Read the FITS header  
  read_fits_header: (length) ->
    return if length == 0
    
    data = @view.getString(length)
    cards = data.split("\n");
    @header = {}
    for card in cards
      c = card.split("=")
      if c.length == 2
        key = c[0].replace(/['"]/g, '').replace(/^\s*([\S\s]*)\b\s*$/, '$1')
        value = c[1].replace(/['"]/g, '').split("/")[0].replace(/^\s*([\S\s]*)\b\s*$/, '$1')
        @header[key] = value
    
  # Read the quantization parameters
  read_quantization_parameters: (length) ->
    return if length == 0
    
    length /= 4
    @quantization_parameters = (@view.getFloat32() for i in [1..length])
  
  read_nan_locations: (length) ->
    return if length == 0
    
    length /= 2
    @nan_locations = (@view.getUint16() for i in [1..length])
  
  # Reads the IDAT (image data) into the class scope for later processing.
  read_idat: (length) ->
    data = (@view.getUint8() for i in [1..length])
    @idat_chunks[@number_of_idat] = data
    @number_of_idat += 1
    
  # Scans a line for image data.
  read_line: =>
    # Reset the filter parameters
    a_param = (0 for index in [1..@param_length])
    
    # Scan the line
    filter_code = @chunk_reader.readByte()
    data = (@chunk_reader.readByte() for index in [1..@line_length])
    
    # Storage for reconstructed data
    recon_data = []
    
    for element, index in data
      # Get the filter parameters
      a = a_param[index % @param_length]
      b = @prev_line[index]
      c = @prev_line[index - @param_length] ? 0
      
      # Filter the data
      recon_data[index] = @filters[filter_code] data[index], a, b, c
      
      # Set the filter parameters for the next iteration
      a_param[index % @param_length] = recon_data[index]
    @prev_line = recon_data
    data = ((recon_data[index] << @shift | recon_data[index + @index_offset]) for index in [0..@line_length - 1] by @param_length)
    return data
    
  # Various filter functions, defined by the PNG specifications: http://www.w3.org/TR/PNG/#9Filters
  filter_none: (x, a, b, c) =>
    return x
  
  filter_sub: (x, a, b, c) =>
    return (x + a) & 0xff
  
  filter_up: (x, a, b, c) =>
    return (x + b) & 0xff
  
  filter_average: (x, a, b, c) =>
    return (x + ((a + b) >> 1)) & 0xff
    
  filter_paeth: (x, a, b, c) =>
    pr = @paeth_predictor(a, b, c)
    return (x + pr) & 0xff
  
  paeth_predictor: (a, b, c) =>
    p = a + b - c
    pa = Math.abs(p - a)
    pb = Math.abs(p - b)
    pc = Math.abs(p - c)

    if pa <= pb and pa <= pc
      pr = a
    else if pb <= pc
      pr = b
    else
      pr = c
    
    return pr


window.AstroPNG = AstroPNG