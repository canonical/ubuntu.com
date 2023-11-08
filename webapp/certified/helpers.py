def get_download_url(model_details):
    """
    Return the appropriate ubuntu models.com/download url for the model
    :param model: a certifiedmodel resource
    :param model_details: a certifiedmodeldetails resource
    :return: appropriate ubuntu.com/download url
    """
    platform_category = model_details.get("category", "").lower()
    architecture = model_details.get("architecture", "").lower()
    make = model_details.get("make", "").lower()

    if model_details.get("level") == "Enabled":
        # Enabled systems use oem images without download links.
        return

    if platform_category in ["desktop", "laptop"]:
        return "https://ubuntu.com/download/desktop"

    if "core" in platform_category:
        if make == "xilinx":
            return "https://ubuntu.com/download/amd"

        return "https://ubuntu.com/download/iot/"

    if "server" in platform_category:
        # Server platforms have special landing pages based on architecture.
        arch = ""
        if "arm" in architecture:
            arch = "arm"
        elif "ppc" in architecture:
            arch = "power"
        elif "s390x" in architecture:
            arch = "s390x"
        else:
            return "https://ubuntu.com/download/server/"

        return f"https://ubuntu.com/download/server/{arch}"

    return "https://ubuntu.com/download"
