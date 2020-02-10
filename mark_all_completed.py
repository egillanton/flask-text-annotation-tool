from app import create_app
from app.database import db
app = create_app()
app.app_context().push()
from app.models.target import Target

targets = Target.query.filter(Target.is_completed == False, Target.labels != None, Target.tokens != None).all()
for target in targets:
	target.is_completed = True

db.session.commit()