import flask


def certification_home():
    return flask.render_template("certification/index.html")
