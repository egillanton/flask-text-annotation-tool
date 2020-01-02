from .base import Base
from ..database import db

class Source(Base):
    __tablename__ = 'sources'

    tokens = db.Column(db.String(128))
    labels = db.Column(db.String(128))
    intent_id = db.Column(db.Integer, db.ForeignKey('intents.id'))
    intent = db.relationship("Intent")
    target_id = db.Column(db.Integer, db.ForeignKey('targets.id'))
    target = db.relationship("Target", uselist=False, back_populates="source")
    training_set = db.Column(db.Boolean, default=False, nullable=False)

    def __repr__(self):
        return f'Tokens: {self.Tokens}'

    def serialize(self):
        return {
            "tokens": self.tokens, 
            "labels": self.labels,
            "intent": self.intent.intent,
        }