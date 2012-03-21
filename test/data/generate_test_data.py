import os
import numpy
import pyfits
import astropng

def create_header():
    header = pyfits.Header()
    header.update('SIMPLE', 'T')
    header.update('BITPIX', -32)
    header.update('NAXIS', 2)
    header.update('NAXIS1', 4)
    header.update('NAXIS2', 4)
    header.update('CRPIX1', 2.5)
    header.update('CRPIX2', 2.5)
    header.update('CRVAL1', 210.801868)
    header.update('CRVAL2', 54.348171)
    header.update('CD1_1', -0.0002798094)
    header.update('CD1_2', 0.0000156364)
    header.update('CD2_1', 0.0000155823)
    header.update('CD2_2', 0.0002791902)
    header.update('CTYPE1', 'RA---TAN')
    header.update('CTYPE2', 'DEC--TAN')
    header.update('CUNIT1', 'deg')
    header.update('CUNIT2', 'deg')
    return header

def generate_test_data():
    
    DIMENSION = 5
    
    # Create FITS image
    data = numpy.random.random(DIMENSION*DIMENSION).astype(numpy.float32)
    data = data.reshape((DIMENSION, DIMENSION))
    header = create_header()
    hdu = pyfits.PrimaryHDU(data, header)
    
    fits_fname = 'test.fits'
    png_fname = 'test.png'
    
    if os.path.exists(fits_fname):
        os.remove(fits_fname)
    hdu.writeto('test.fits')
    
    # Convert to PNG
    ap = astropng.AstroPNG('test.fits')
    if os.path.exists(png_fname):
        os.remove(png_fname)
    ap.to_png('test.png', crush = False)
    
if __name__ == '__main__':
    generate_test_data()