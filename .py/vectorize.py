import vtracer
import os

png_path = 'c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/assets/icons/icon-512x512.png'
svg_path = 'c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/assets/icons/icon-512x512.svg'

try:
    vtracer.convert_image_to_svg_py(png_path, svg_path)
    print("Vectorization complete.")
except Exception as e:
    import traceback
    traceback.print_exc()
