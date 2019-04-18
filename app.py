from flask import Flask, request, render_template
import sys

app = Flask(__name__)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/move')
def move():
    data = request.args.get('data')
    print(
        'MOVE from:{} data:{}'.format(request.remote_addr, data),
        file=sys.stderr
    )
    return ('', 204)


if __name__ == '__main__':
    app.run(debug=True)
