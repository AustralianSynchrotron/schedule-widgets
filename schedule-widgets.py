import json
import os
import datetime
import dateutil.parser
from pytz import timezone
from flask import Flask, render_template, jsonify, request, url_for
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
js_scrollable = Bundle('common.coffee',
                       'common_bindings.coffee',
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
    return jsonify(json.load(open(os.path.join(
        os.path.dirname(__file__), "static", "data", "experiments.json"))))


@app.route('/api/visits')
def visits():
    melbourne = timezone('Australia/Melbourne')

    exp_id = int(request.args.get('expId', 1234))
    start_date = dateutil.parser.parse(
        request.args.get('startDate', datetime.datetime.today().isoformat()))
    end_date = dateutil.parser.parse(
        request.args.get('endDate',
                         (datetime.date.today() +
                          datetime.timedelta(days=1)).isoformat()))

    today = datetime.datetime.combine(datetime.date.today(), datetime.time(8))
    visits_json = json.load(open(os.path.join(
        os.path.dirname(__file__), "static", "data", "visits_%i.json" % exp_id))
    )

    result = {'visits': []}
    for visit in visits_json['visits']:
        visit_start = melbourne.localize(today + datetime.timedelta(hours=visit['start']))
        visit_end = melbourne.localize(today + datetime.timedelta(hours=visit['end']))

        if visit_end >= start_date and visit_start <= end_date:
            result['visits'].append({
                'id': visit['id'],
                'startDate': visit_start.isoformat(),
                'endDate': visit_end.isoformat()
            })
    return jsonify(result)

if __name__ == '__main__':
    app.run(port=7654, debug=True)
