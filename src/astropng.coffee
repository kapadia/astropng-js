
class AstroPNG

  constructor: (buffer) ->
    @view = new jDataView buffer, undefined, undefined, false
    @idatChunks = []
    @currentLine = 0
    @imageData = []

    # Variables to help check PNG format
    @eof = false
    @numberOfIHDR = 0
    @numberOfIDAT = 0

    @checkSignature()

    @evt = document.createEvent("Event")
    @evt.initEvent('readLine', true, true)

    # Set up filtering related variables
    @filters = [@filterNone, @filterSub, @filterUp, @filterAverage, @filterPaeth]

    # Loop through chunks
    while !@eof
      @readChunk()

    # Initialize a decompressor for IDAT
    @chunkReader = new Inflator ({
       chunk: 0,
       index: 2,
       data: @idatChunks,
       num_chunks: @numberOfIDAT
       readByte: () ->
         if @chunk >= @data.length
           return -1
         while (@index >= @data[@chunk].length)
           @index = 0
           @chunk += 1
           if (@chunk >= @numChunks)
             return -1
         @index += 1
         return @data[@chunk][@index - 1]
    })

  # Convert bytes to an integer
  @toInteger: (bytes, index) ->
    return (bytes[index] << 24) | (bytes[index + 1] << 16) | (bytes[index + 2] << 8) | bytes[index + 3]

  # Random number generator used for subtractive dithering
  @randomNumberGenerator: (n) ->
    a     = 16807.0
    m     = 2147483647.0
    seed  = 1

    randomNumbers = []
    for i in [0..n]
      temp = a * seed
      seed = temp - m * Math.floor(temp / m)
      randomNumbers.push(seed / m)
    return randomNumbers

  # Verify PNG signature
  @pngSignature: [137, 80, 78, 71, 13, 10, 26, 10]
  checkSignature: -> @verifyByte(byte) for byte in AstroPNG.pngSignature
  verifyByte: (byte) ->
    throw "PNG signature is not correct" unless byte is @view.getUint8()
  
  # Read a PNG chunk, determines the length and type, and extracts the data
  readChunk: ->
    length = @view.getUint32()
    type = @view.getString(4)
    
    # console.log length, type
    
    switch type
      when 'IHDR'
        @readIHDR length
      when 'fITS'
        @readFitsHeader length
      when 'qANT'
        @readQuantizationParameters length
      when 'nANS'
        @readNaNLocations length
      when 'IDAT'
        @readIDAT length
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
  readIHDR: (length) ->
    @numberOfIHDR += 1
    
    data = (@view.getUint8() for i in [1..length])

    # Check if the number of IHDR chunks exceeds one
    throw "PNG contains too many IHDR chunks" if @numberOfIHDR > 1

    @width = AstroPNG.toInteger data, 0
    @height = AstroPNG.toInteger data, 4

    @evt.numberOfLines = @height

    # Check the color type (only supporting grayscale for now)
    allowedColorTypes = [0]
    throw "PNG contains an unallowed color type (only supporting grayscale)" if allowedColorTypes.indexOf(data[9]) < 0
    @colorType = data[9]

    # Check the bit depth based on the color type (only support 8 and 16)
    allowedBitDepths = [8, 16]
    throw "PNG contains an unallowed bit depth (only supporting 8 and 16 bit depths)" if allowedBitDepths.indexOf(data[8]) < 0
    @bitDepth = data[8]

    # Define data relavant to bit depth needed to scan lines
    @shift = @bitDepth - 8
    @paramLength = (@bitDepth / 8)
    @lineLength = @paramLength * @width
    @indexOffset = @paramLength - 1
    
    # Initialize previous line with zeros
    @prevLine = (0 for index in [1..@lineLength])
    
    # Check the compression method
    throw "PNG contains an unknown compression method" if data[10] != 0
    @compression = data[10]

    # Check the filter method
    throw "PNG contains an unknown filter method" if data[11] != 0
    @filterMethod = data[11]
    
    # Check the interlace method
    throw "PNG contains an unknown interlace method" if data[12] != 0 and data[12] != 1
    @interlaceMethod = data[12]
  
  # Read the FITS header  
  readFitsHeader: (length) ->
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
    @minimumPixel = parseFloat(@header['MINPIXEL']) if @header.hasOwnProperty('MINPIXEL')
    @maximumPixel = parseFloat(@header['MAXPIXEL']) if @header.hasOwnProperty('MAXPIXEL')
    
  # Read the quantization parameters
  readQuantizationParameters: (length) ->
    return if length == 0
    
    length /= 4
    @quantizationParameters = (@view.getFloat32() for i in [1..length])
    @randomNumbers = AstroPNG.randomNumberGenerator(@width * @height)
  
  readNaNLocations: (length) ->
    return if length == 0
    
    length /= 2
    nanLocations = (@view.getUint16() for i in [1..length])
    
    length /= 2
    @yNaN = nanLocations.slice(0, length)
    @xNaN = nanLocations.slice(length)
  
  # Reads the IDAT (image data) into the class scope for later processing.
  readIDAT: (length) ->
    data = (@view.getUint8() for i in [1..length])
    @idatChunks[@numberOfIDAT] = data
    @numberOfIDAT += 1
    
  # Scans a line for image data.
  readLine: =>
    # Reset the filter parameters
    aParam = (0 for index in [1..@paramLength])
    
    # Scan the line
    filterCode = @chunkReader.readByte()
    data = (@chunkReader.readByte() for index in [1..@lineLength])
    
    # Storage for reconstructed data
    reconData = []
    
    for element, index in data
      # Get the filter parameters
      a = aParam[index % @paramLength]
      b = @prevLine[index]
      c = @prevLine[index - @paramLength] ? 0
      
      # Filter the data
      reconData[index] = @filters[filterCode] data[index], a, b, c
      
      # Set the filter parameters for the next iteration
      aParam[index % @paramLength] = reconData[index]
      
    @prevLine = reconData
    if @quantizationParameters?
      zero  = @quantizationParameters[2*@currentLine]
      scale = @quantizationParameters[2*@currentLine + 1]
      r     = @randomNumbers.slice(0, @width)
      
      dataInteger = ((reconData[index] << @shift | reconData[index + @indexOffset]) for index in [0..@lineLength - 1] by @paramLength)
      data = ( (dataInteger[index] - r[index] + 0.5) * scale + zero for index in [0..dataInteger.length - 1] )
      @randomNumbers = @randomNumbers.slice(@width)
      
      # Replace NaNs in correct locations
      if @yNaN?
        indices = []
        index = @yNaN.indexOf(@currentLine)
        while index != -1
          indices.push(index)
          index = @yNaN.indexOf(@currentLine, index + 1)
        data[@xNaN[index]] = Number.NaN for index in indices
    else
      data = ((reconData[index] << @shift | reconData[index + @indexOffset]) for index in [0..@lineLength - 1] by @paramLength)

    @evt.currentLine = @currentLine    
    window.dispatchEvent(@evt)

    @imageData = @imageData.concat(data)
    @currentLine += 1
    
  # Various filter functions, defined by the PNG specifications: http://www.w3.org/TR/PNG/#9Filters
  filterNone: (x, a, b, c) =>
    return x
  
  filterSub: (x, a, b, c) =>
    return (x + a) & 0xff
  
  filterUp: (x, a, b, c) =>
    return (x + b) & 0xff
  
  filterAverage: (x, a, b, c) =>
    return (x + ((a + b) >> 1)) & 0xff
    
  filterPaeth: (x, a, b, c) =>
    pr = @paethPredictor(a, b, c)
    return (x + pr) & 0xff
  
  paethPredictor: (a, b, c) =>
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

  readImageData: => @readLine() for j in [1..@height]

  computeStatistics: =>
    @readImageData() unless @imageData?
    
    imageData = (pixel for pixel in @imageData when not isNaN(pixel))

    # Minimum and maximum pixels
    minsInRow = (Math.min.apply(Math, imageData[i*@width..i*@width+@width]) for i in [1..@height])
    maxsInRow = (Math.max.apply(Math, imageData[i*@width..i*@width+@width]) for i in [1..@height])
    
    @minimumPixel = Math.min.apply(Math, minsInRow)
    @maximumPixel = Math.max.apply(Math, maxsInRow)
    
    # Mean
    sum = 0
    sum += pixel for pixel in imageData
    @mean = sum / imageData.length

    # Standard deviation
    diff2 = 0
    diff2 += (pixel - @mean) * (pixel - @mean) for pixel in imageData
    diff2 /= imageData.length
    @std = Math.sqrt(diff2)
  
  getIntensity: (x, y) ->
    index = @width * parseInt(y + 0.5) + parseInt(x + 0.5);
    return false if index > @imageData.length
    return @imageData[index]
    
window.AstroPNG = AstroPNG