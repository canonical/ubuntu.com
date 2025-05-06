"""
CSS optimization module for ubuntu.com
"""

from webapp.context_css import get_optimized_css

def init_css_optimization(app):
    """
    Initialize CSS optimization for the Flask application
    """
    # Add the get_optimized_css function to the template context
    @app.context_processor
    def inject_optimized_css():
        return {
            "get_optimized_css": get_optimized_css
        }