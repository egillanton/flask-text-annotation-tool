
import os

from flask import Flask, render_template, request, jsonify, abort, json
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_fontawesome import FontAwesome

from config import Config
from . import google

def create_app(test_config=None):
    """create and configure the app"""
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_object(Config)
    from .database import db
    db.init_app(app)
    from .models.source import Source
    from .models.target import Target
    from .models.intent import Intent
    from .models.label import Label
    migrate = Migrate(app, db)
    fa = FontAwesome(app)

    # ======== Routing ============================= #
    # -------- Home -------------------------------- #
    @app.route('/', methods=['GET'])
    def index():
        data = get_stats()
        return render_template('layouts/index.html', data=data.json)

    # -------- Samples -------------------------------- #
    @app.route('/samples', methods=['GET'])
    def samples():
        return render_template('layouts/sample_list.html')

    # -------- Sample -------------------------------- #
    @app.route('/samples/<int:sample_id>', methods=['GET'])
    def sample(sample_id):
        data = get_sample(sample_id)
        return render_template('layouts/sample.html', data=data.json)

    # -------- Annotate -------------------------------- #
    @app.route('/annotate/<preference>', methods=['GET'])
    def annotate_str(preference):
        if not preference or preference.lower() == 'new':
            target = Target.query.filter(Target.tokens == None).first()

        elif preference.lower() == "uncompleted":
            target =  Target.query.filter(Target.tokens != None).filter(Target.is_completed == False).first()

        if target:
            data = get_sample(target.source.id)
            return render_template('layouts/annotate.html', data=data.json)
        else:
            return render_template('layouts/annotate.html')

    @app.route('/annotate/<int:sample_id>', methods=['GET'])
    def annotate_int(sample_id):
        data = get_sample(sample_id)
        return render_template('layouts/annotate.html', data=data.json)

    # ======== REST API ============================= #
    # -------- Stats -------------------------------- #
    @app.route('/api/stats', methods=['GET'])
    def get_stats():
        target_samples = len(Target.query.all())
        remaining_target_samples = len(Target.query.filter(Target.is_completed == False).all())
        uncompleted_target_samples = len(Target.query.filter(Target.is_completed == False and Target.tokens != None).all())

        return jsonify(
            total= target_samples,
            remaining= remaining_target_samples,
            uncompleted=uncompleted_target_samples,
        )

    # -------- Samples -------------------------------- #
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
        
 
    # -------- Samples -------------------------------- #
    @app.route('/api/samples/<int:sample_id>', methods=['GET', 'POST'])
    def get_sample(sample_id):
        if request.method == "GET":
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
        elif request.method == 'POST':
            target_sample = Target.query.get(sample_id)
            target_sample.tokens = request.json['sample_tokens']
            target_sample.labels = request.json['sample_labels']
            target_sample.is_completed = request.json['sample_is_completed']
            db.session.commit()
            return json.dumps({'success':True}), 200, {'ContentType':'application/json'} 

            


    # -------- Translate -------------------------------- #
    @app.route('/api/translate', methods=['POST'])
    def translate():
        source_text = request.json['source_text']
        translation = google.get_translation(source_text)
        return jsonify(
            translation=translation.lower(),
        )

    # -------- Slot Tags ---------------------#
    @app.route('/api/tags', methods=['GET'])
    def tags():
        labels = db.session.query(Label.label).all()

        return jsonify(
            labels=labels,
        )

    return app
