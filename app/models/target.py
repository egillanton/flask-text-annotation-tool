from .base import Base
from ..database import db

class Target(Base):
    __tablename__ = 'targets'

    tokens = db.Column(db.String(128))
    labels = db.Column(db.String(128))
    intent_id = db.Column(db.Integer, db.ForeignKey('intents.id'))
    intent = db.relationship("Intent")
    source = db.relationship("Source", back_populates="target", uselist=False)
    is_training_set = db.Column(db.Boolean, default=False, nullable=False)
    is_completed = db.Column(db.Boolean, default=False, nullable=False)

    def __repr__(self):
        return f'Tokens: {self.Tokens}'

    def serialize(self):
        return {
            'tokens': self.tokens, 
            'labels': self.labels,
            'intent': self.intent.intent,
            'is_training_set': self.is_training_set,
            'is_completed': self.is_completed,
        }