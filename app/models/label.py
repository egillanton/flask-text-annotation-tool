from .base import Base
from ..database import db

class Label(Base):
    __tablename__ = 'labels'
    
    label = db.Column(db.String(30), unique=True, nullable=False)
