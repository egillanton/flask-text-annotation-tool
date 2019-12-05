import os

from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_fontawesome import FontAwesome

from config import Config
from . import repository as repo
from . import google

db = SQLAlchemy()
from app.models import Source, Target, Label

def create_app(test_config=None):
    """create and configure the app"""
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_object(Config)
    db = SQLAlchemy(app)
    migrate = Migrate(app, db)
    fa = FontAwesome(app)
    # ======== Routing ============================= #
    # -------- Home -------------------------------- #
    @app.route('/', methods=['GET'])
    def index():
        return render_template('layouts/index.html')

    # -------- Sample -------------------------------- #
    @app.route('/sample', methods=['GET', 'POST'])
    def sample():
        if request.method == 'POST':
            sample_id = request.json['sample_id']
            target_tokens = request.json['target_tokens']
            target_labels = request.json['target_labels']
            target_intent = request.json['target_intent']
            repo.store_sample(target_tokens, target_labels, target_intent)
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

    # -------- Translate -------------------------------- #
    @app.route('/translate', methods=['POST'])
    def translate():
        source_text = request.json['source_text']
        translation = google.get_translation(source_text)
        return jsonify(
            translation=translation.lower(),
        )

    # -------- Get Slot Tags (Labels) ---------------------#
    @app.route('/tags', methods=['GET'])
    def tags():
        lables = db.session.query(Label.label).all()
     
        return jsonify(
            lables=lables,
        )

    return app
