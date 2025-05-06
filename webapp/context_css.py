import os
import flask

def get_optimized_css(path=None):
    """
    Determine if there's an optimized CSS file for the current route
    and return the appropriate CSS path
    
    Args:
        path: Optional path to check. If not provided, uses the current request path.
    """
    # Default CSS path
    default_css = "/static/css/styles.css"
    
    # If no path is provided, get it from the current request
    if path is None:
        # Make sure we're in a request context
        if not flask.has_request_context():
            return default_css
        path = flask.request.path
    
    # Extract the first part of the path (the route)
    route = path.strip("/").split("/")[0] if path.strip("/") else "index"
    
    # Check if we have an optimized CSS file for this route
    optimized_css = f"/static/css/pages/{route}/{route}.purged.css"
    
    # Check if the optimized CSS file exists
    if os.path.exists(os.path.join(flask.current_app.root_path, "..", optimized_css.lstrip("/"))):
        return optimized_css
    
    # Fall back to the default CSS
    return default_css