import io
import os
import textwrap
import flask
from flask import Response
from PIL import Image
from PIL import ImageFont
from PIL import ImageDraw


def generate_meta_image():
    static_folder = "static/files/"
    title = flask.request.args.get("title", "")
    overlay_image = "meta_image_blank.png"

    # wrap text
    wrapper = textwrap.TextWrapper(width=23)
    wrapped_title = "\n".join(wrapper.wrap(text=title))

    img = Image.open(str(os.path.join(static_folder, overlay_image)))
    draw = ImageDraw.Draw(img)
    # font = ImageFont.truetype(<font-file>, <font-size>)
    font = ImageFont.truetype(
        str(os.path.join(static_folder, "Ubuntu-L.ttf")), 60
    )
    draw.text(
        (100, 75),
        wrapped_title,
        (10, 10, 10),
        font=font,
    )
    buffer = io.BytesIO()
    img.save(buffer, optimize=True, quality=50, format="WebP")
    return Response(buffer.getvalue(), mimetype="image/webp")
