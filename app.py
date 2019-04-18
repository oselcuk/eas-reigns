import flask
import sys

app = flask.Flask(__name__)


@app.route('/')
def index():
    return flask.render_template('index.html')


@app.route('/move')
def move():
    print(flask.request.args.get('data'), file=sys.stderr)
    return ('', 204)


if __name__ == '__main__':
    app.run(debug=True)
