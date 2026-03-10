from PIL import Image, ImageOps
from pathlib import Path

scale = 0.5

for img_path in Path(".").glob("*"):
    if img_path.suffix.lower() in [".jpg", ".jpeg", ".png", ".webp"]:
        img = Image.open(img_path)

        # sửa orientation từ EXIF
        img = ImageOps.exif_transpose(img)

        new_size = (
            int(img.width * scale),
            int(img.height * scale)
        )

        img_resized = img.resize(new_size, Image.LANCZOS)
        img_resized.save(img_path)

        print(f"Resized: {img_path}")