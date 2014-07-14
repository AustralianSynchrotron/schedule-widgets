import os
import datetime
from flask import Flask, render_template, jsonify, request
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
js_scrollable = Bundle('common_bindings.coffee',
                       'schedule-scrollable/bindings.coffee',
                       'schedule-scrollable/application.coffee',
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


#-------------------------------------------
#                API
#-------------------------------------------
@app.route('/api/experiments')
def experiments():
    return jsonify({
        'experiments': [
            {
                'id': 1234,
                'shortname': "AB1",
                'longname': "Awesome Beamline 1"
            },
            {
                'id': 4321,
                'shortname': "AB2",
                'longname': "Awesome Beamline 2"
            }
        ]
    })


@app.route('/api/visits')
def visits():
    exp_id = int(request.args.get('expId', 1234))
    start_date = request.args.get('startDate',
                                  datetime.datetime.today().isoformat())
    end_date = request.args.get('endDate',
                                (datetime.date.today() +
                                datetime.timedelta(days=1)).isoformat())

    if exp_id == 1234:
        return jsonify({
            'visits': [
                {
                    'id': 800,
                    'startDate': datetime.datetime.today().isoformat(),
                    'endDate': (datetime.datetime.today() +
                                datetime.timedelta(hours=4)).isoformat()
                },
                {
                    'id': 801,
                    'startDate': (datetime.datetime.today() +
                                  datetime.timedelta(hours=5)).isoformat(),
                    'endDate': (datetime.datetime.today() +
                                datetime.timedelta(hours=9)).isoformat()
                }
            ]
        })
    else:
        return jsonify({
            'visits': [
                {
                    'id': 900,
                    'startDate': (datetime.datetime.today() +
                                  datetime.timedelta(hours=-1)).isoformat(),
                    'endDate': (datetime.datetime.today() +
                                datetime.timedelta(hours=3)).isoformat()
                }
            ]
        })

if __name__ == '__main__':
    app.run(port=7654, debug=True)
