
import os

from flask import Flask, render_template, request, jsonify, abort
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
            print(request)
            sample_id = request.json['sample_id']
            sample_tokens = request.json['sample_tokens']
            sample_labels = request.json['sample_labels']
            sample_intent = request.json['sample_intent']
            sample_is_completed = request.json['sample_is_completed']

            if not (sample_labels and sample_tokens and  (len(sample_labels.split(" ")) == len(sample_tokens.split(" "))) and sample_id and sample_intent):
                return jsonify(
                    success="False",
                    message="Field a field is incorrect"
                )
            else:
                source_sample = Source.query.get(sample_id)
                target_sample = Target.query.get(source_sample.target_id)
                target_sample.tokens = sample_tokens
                target_sample.labels = sample_labels
                target_sample.is_completed =  sample_is_completed
                db.session.commit()

                return jsonify(success="True")
        
            
        else:
            # Without Id
            uncompleted_target = Target.query.filter(Target.is_completed == False).first()
            sample = Source.query.get(uncompleted_target.source.id)
            # sample = db.session.query.join(Source, uncompleted_target.source).single()

            return jsonify(
                sample_tokens=sample.tokens,
                sample_labels=sample.labels,
                sample_intent=sample.intent.intent,
                sample_id=sample.id,
            )
    # -------- Samples -------------------------------- #
    @app.route('/samples', methods=['GET'])
    def samples():
        return render_template('layouts/sample_list.html')


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
        labels = db.session.query(Label.label).all()

        return jsonify(
            labels=labels,
        )

    # ======== REST API ============================= #
    @app.route('/api/samples', methods=['GET'])
    def get_samples():
        source_samples = Source.query.all()
        if not source_samples:
            abort(404)
        
        target_samples = Target.query.all()
        if not target_samples:
            abort(404)

        return jsonify(
            samples=[
                {
                    "id": source_sample.id, 
                    "source": source_sample.serialize(), 
                    "target": target_sample.serialize()
                } 
            for source_sample,target_sample in zip(source_samples, target_samples)]
        )
        
 
    
    @app.route('/api/samples/<int:sample_id>', methods=['GET'])
    def get_sample(sample_id):
        source_sample = Source.query.get(sample_id)
        if not source_sample:
            abort(404)
        
        target_sample = Target.query.get(sample_id)
        if not target_sample:
            abort(404)
        
        return jsonify(
            {
                "id": sample_id, 
                "source": source_sample.serialize(), 
                "target": target_sample.serialize(),
            } 
        )

    return app
