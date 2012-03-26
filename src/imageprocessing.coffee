
ImageProcessing = 
  
  # http://www.sdss.org/dr7/algorithms/fluxcal.html#asinh_table
  softening: { u: 1.4E-10, g: 0.9E-10, r: 1.2E-10, i: 1.8E-10, z: 7.4E-10 }
  
  getExtremes: (astropngs) ->
    vmin = 0
    vmax = 0
    for astropng in astropngs
      vmin += astropng.minimumPixel * astropng.minimumPixel
      vmax += astropng.maximumPixel * astropng.maximumPixel
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

  stretch: (astropng, vmin, vmax, canvasArr) ->    
    imageData = astropng.imageData
    softening = @softening[astropng.header.filter]
    
    numberOfPixels = imageData.length
    length = 4 * numberOfPixels

    min = if vmin? then @normalize(vmin, softening) else @normalize(astropng.minimumPixel, softening)
    max = if vmax? then @normalize(vmax, softening) else @normalize(astropng.maximumPixel, softening)

    for i in [0..length - 1] by 4
      index = i / 4

      pixel = imageData[index]
      pixel = @normalize(pixel, softening)
      pixel = @scale(pixel, min, max)

      canvasArr[i + 0] = pixel
      canvasArr[i + 1] = pixel
      canvasArr[i + 2] = pixel
      canvasArr[i + 3] = 255

    return canvasArr

  # http://adsabs.harvard.edu/abs/2004PASP..116..133L
  luptonColorComposite: (astropngs, vmin, vmax, canvasArr) ->
    numberOfPixels = astropngs[0].imageData.length
    length = 4 * numberOfPixels

    softening = 1
    range = vmax - vmin

    imageDataR = astropngs[0].imageData
    imageDataG = astropngs[1].imageData
    imageDataB = astropngs[2].imageData

    for i in [0..length-1] by 4
      index = i / 4
      r = imageDataR[index]
      g = imageDataG[index]
      b = imageDataB[index]

      # RMS of the pixel value
      pixel = Math.sqrt((r*r + g*g + b*b) / 3)

      # Check the average value
      if pixel is 0
        canvasArr[i + 0] = 0
        canvasArr[i + 1] = 0
        canvasArr[i + 2] = 0
        canvasArr[i + 3] = 255
      else
        normalizedPixel = @normalizeLupton(pixel, softening, vmin, vmax)

        R = r * normalizedPixel / pixel
        G = g * normalizedPixel / pixel
        B = b * normalizedPixel / pixel

        maxRGB = Math.max(R, G, B)
        if maxRGB > 1
          R = R / maxRGB
          G = G / maxRGB
          B = B / maxRGB

        canvasArr[i + 0] = 255 * R
        canvasArr[i + 1] = 255 * G
        canvasArr[i + 2] = 255 * B
        canvasArr[i + 3] = 255

    return canvasArr
  
window.ImageProcessing = ImageProcessing