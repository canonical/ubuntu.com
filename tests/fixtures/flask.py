from webapp.app import app

app.testing = True


def client():
    return app.test_client()
