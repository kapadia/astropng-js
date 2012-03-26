
ImageProcessing = 
  
  # Softening parameters by SDSS filter 
  # http://www.sdss.org/dr7/algorithms/fluxcal.html#asinh_table
  softening: { u: 1.4E-10, g: 0.9E-10, r: 1.2E-10, i: 1.8E-10, z: 7.4E-10 }
  
  getExtremes: (astropngs) ->
    vmin = 0
    vmax = 0
    for astropng in astropngs
      vmin += astropng.min * astropng.min
      vmax += astropng.max * astropng.max
    vmin = Math.sqrt(vmin / astropngs.length)
    vmax = Math.sqrt(vmax / astropngs.length)
    return [vmin, vmax]
    
  normalize: (z, beta) ->
    z /= beta
    return Math.log(z + Math.sqrt(1 + z * z))
  
  normalizeLupton: (z, beta, min, max) ->
    return 0 if z < min
    return 1 if z > max
    return (@normalize(z - min, beta) / @normalize(max - min, beta))
    
  scale: (pixel, min, max) ->
    return 255 * (pixel - min) / (max - min)

  stretch: (astropng, vmin, vmax, canvasArray) ->
    numberOfPixels = astropng.imageData.length
    length = 4 * numberOfPixels
    data = image.data
    min = if vmin? then @normalize(vmin, @softening[image.filter]) else @normalize(image.min, @softening[image.filter])
    max = if vmax? then @normalize(vmax, @softening[layer.filter]) else @normalize(layer.max, @softening[layer.filter])

    for i in [0..length - 1] by 4
      index = i / 4

      # Grab the pixel
      pixel = data[index]

      # BAM!
      pixel = @normalize(pixel, @softening[layer.filter])

      # Scale
      pixel = @scale(pixel, min, max)

      # Copy to canvas array
      canvas_arr[i + 0] = pixel
      canvas_arr[i + 1] = pixel
      canvas_arr[i + 2] = pixel
      canvas_arr[i + 3] = 255

    return canvas_arr
  
window.ImageProcessing = ImageProcessing