from . import db

# One to One


class Source(db.Model):
    __tablename__ = 'sources'
    id = db.Column(db.Integer, primary_key=True)
    tokens = db.Column(db.String(128))
    labels = db.Column(db.String(128))
    intent_id = db.Column(db.Integer, db.ForeignKey('intents.id'))
    intent = db.relationship("Intent")
    target_id = db.Column(db.Integer, db.ForeignKey('targets.id'))
    target = db.relationship("Target", uselist=False, back_populates="source")
    training_set = db.Column(db.Boolean, default=False, nullable=False)

    def __repr__(self):
        return f'Tokens: {self.Tokens}'


class Target(db.Model):
    __tablename__ = 'targets'
    id = db.Column(db.Integer, primary_key=True)
    tokens = db.Column(db.String(128))
    labels = db.Column(db.String(128))
    intent_id = db.Column(db.Integer, db.ForeignKey('intents.id'))
    intent = db.relationship("Intent")
    source = db.relationship("Source", back_populates="target", uselist=False)
    training_set = db.Column(db.Boolean, default=False, nullable=False)
    is_completed = db.Column(db.Boolean, default=False, nullable=False)

    def __repr__(self):
        return f'Tokens: {self.Tokens}'


class Intent(db.Model):
    __tablename__ = 'intents'
    id = db.Column(db.Integer, primary_key=True)
    intent = db.Column(db.String(30), unique=True, nullable=False)


class Label(db.Model):
    __tablename__ = 'labels'
    id = db.Column(db.Integer, primary_key=True)
    label = db.Column(db.String(30), unique=True, nullable=False)
