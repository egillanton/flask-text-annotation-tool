from .base import Base
from ..database import db

class Intent(Base):
    __tablename__ = 'intents'
    
    intent = db.Column(db.String(30), unique=True, nullable=False)
