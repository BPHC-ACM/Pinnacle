from PIL import Image

# Load your original image
input_image_path = r"S:\Coding\Pinnacle\frontend\app\assets\icons\app_icon_final.png"  # change to your image file
output_image_path = r"S:\Coding\Pinnacle\frontend\app\assets\launcher\launcher_icon.png"
# Background color (RGB)
bg_color = (2, 6, 23)

# Open the image and ensure it has an alpha channel
img = Image.open(input_image_path).convert("RGBA")

# Create a background image of the same size
background = Image.new("RGBA", img.size, bg_color + (255,))

# Alpha composite the original image over the background
composite = Image.alpha_composite(background, img)

# Save the result
composite.save(output_image_path)
print(f"Saved blended image as {output_image_path}")