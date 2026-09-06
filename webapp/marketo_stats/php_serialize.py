"""Minimal reader for PHP's serialize() format.

Marketo stores the answers a person gave in a form as a PHP-serialised
string. String lengths in that format are byte counts, and the values
themselves contain the delimiter characters, so the only correct way to
read it is by length. Splitting on ';' or '"' will corrupt any value
holding a URL.

Only the subset Marketo emits is supported: a flat associative array of
strings, integers, booleans and nulls.
"""


def loads(blob):
    """Parse a PHP-serialised associative array into a dict."""
    if not isinstance(blob, str):
        raise ValueError("expected a string")

    data = blob.encode("utf-8")
    if not data.startswith(b"a:"):
        raise ValueError("expected a serialised array at the root")

    value, offset = _parse(data, 0)
    if offset != len(data):
        raise ValueError("trailing data after the root array")
    return value


def _parse(data, offset):
    end = offset + 2
    marker = data[offset:end]
    if marker == b"a:":
        return _parse_array(data, offset)
    if marker == b"s:":
        return _parse_string(data, offset)
    if marker == b"i:":
        return _parse_number(data, offset, int)
    if marker == b"b:":
        return _parse_number(data, offset, lambda raw: bool(int(raw)))
    if marker == b"N;":
        return None, offset + 2
    raise ValueError(f"unknown type marker at byte {offset}")


def _parse_array(data, offset):
    count, cursor = _read_int_until(data, offset + 2, b":")
    end = cursor + 1
    if data[cursor:end] != b"{":
        raise ValueError(f"expected '{{' at byte {cursor}")
    cursor += 1

    result = {}
    for _ in range(count):
        key, cursor = _parse(data, cursor)
        value, cursor = _parse(data, cursor)
        result[key] = value

    end = cursor + 1
    if data[cursor:end] != b"}":
        raise ValueError(f"expected '}}' at byte {cursor}")
    return result, cursor + 1


def _parse_string(data, offset):
    length, cursor = _read_int_until(data, offset + 2, b":")
    end = cursor + 1
    if data[cursor:end] != b'"':
        raise ValueError(f"expected opening quote at byte {cursor}")

    start = cursor + 1
    end = start + length
    term_end = end + 2
    if data[end:term_end] != b'";':
        raise ValueError(f"string not terminated at byte {end}")
    return data[start:end].decode("utf-8"), end + 2


def _parse_number(data, offset, cast):
    end = data.find(b";", offset + 2)
    if end == -1:
        raise ValueError(f"unterminated value at byte {offset}")
    try:
        start = offset + 2
        return cast(data[start:end]), end + 1
    except ValueError:
        raise ValueError(f"bad numeric value at byte {offset}")


def _read_int_until(data, offset, terminator):
    end = data.find(terminator, offset)
    if end == -1:
        raise ValueError(f"unterminated length at byte {offset}")
    try:
        return int(data[offset:end]), end + 1
    except ValueError:
        raise ValueError(f"bad length at byte {offset}")
