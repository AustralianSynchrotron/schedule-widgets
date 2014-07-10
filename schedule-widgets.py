from flask import Flask, render_template
from flask.ext.assets import Environment, Bundle

app = Flask(__name__)

assets = Environment(app)

# JavaScript scrollable widget
js_scrollable = Bundle('widgets/js/schedule-scrollable/application.js',
                       filters='jsmin',
                       output='widgets/js/schedule-scrollable.js')
assets.register('js_scrollable', js_scrollable)

# CSS scrollable widget
css_scrollable = Bundle('widgets/css/schedule-scrollable/main.less',
                        filters='less',
                        output='widgets/css/schedule-scrollable.css')
assets.register('css_scrollable', css_scrollable)


@app.route('/')
def index():
    return render_template('index.html')


if __name__ == '__main__':
    app.run(port=7654, debug=True)
