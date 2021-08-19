def to_dict(structure, class_key=None):
    """Converts structure to dictionary

    Parameters
    ----------
    structure: Any
        Can be a String, Object, List/Dict of Strings or Objects
    class_key: str
        Stores the name of the object, used as a key in the dict.

    Returns
    -------
    dict
        If structure is an object
    Any
        The same type as structure
    """
    if isinstance(structure, list):
        data = []
        for value in structure:
            data.append(to_dict(value))
        return data
    elif isinstance(structure, dict):
        data = {}
        for (key, value) in structure.items():
            data[key] = to_dict(value, class_key)
        return data
    elif hasattr(structure, "__dict__"):
        data = dict(
            [
                (key, to_dict(value, class_key))
                for key, value in structure.__dict__.items()
                if not callable(value) and not key.startswith("_")
            ]
        )
        if class_key is not None and hasattr(structure, "__class__"):
            data[class_key] = structure.__class__.__name__
        return data
    else:
        return structure
