import os

from flask import Flask, render_template, request, jsonify


def create_app(test_config=None):
    """create and configure the app"""
    app = Flask(__name__, instance_relative_config=True)
    app.secret_key = os.urandom(12)  # Generic key for dev purposes only

    # ======== Routing ============================= #
    # -------- Home -------------------------------- #
    @app.route('/', methods=['GET'])
    def index():
        return render_template('layouts/index.html')

    # -------- SAMPLE -------------------------------- #
    @app.route('/sample', methods=['GET', 'POST'])
    def sample():
        if request.method == 'POST':
            sample_id = request.json['sample_id']
            target_tokens = request.json['target_tokens']
            target_labels = request.json['target_labels']
            target_intent = request.json['target_intent']
        else:
            try:
                # With Id
                sample_id = request.json['sample_id']
                response = ''
            except:
                # Without Id
                response = ''
            finally:
                return jsonify(
                    response=response,
                )

        return render_template('expression')
    return app
