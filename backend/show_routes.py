from main import app

for route in app.routes:
    methods = getattr(route, "methods", "")
    print(route.path, methods)