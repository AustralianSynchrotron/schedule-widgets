import os
from flask import Flask, render_template
from flask.ext.assets import Environment, Bundle

app = Flask(__name__)

assets = Environment(app)

# just for development on Windows
assets.cache = False
assets.manifest = False

assets.load_path = [
    os.path.join(os.path.dirname(__file__), 'less'),
    os.path.join(os.path.dirname(__file__), 'coffee')
]

# JavaScript scrollable widget
js_scrollable = Bundle('schedule-scrollable/application.coffee',
                       filters='coffeescript',
                       output='js/schedule-scrollable.js')
assets.register('js_scrollable', js_scrollable)

# CSS scrollable widget
css_scrollable = Bundle('schedule-scrollable/main.less',
                        depends='schedule-scrollable/*.less',
                        filters='less',
                        output='css/schedule-scrollable.css')
assets.register('css_scrollable', css_scrollable)


@app.route('/')
def index():
    return render_template('index.html')


if __name__ == '__main__':
    app.run(port=7654, debug=True)
