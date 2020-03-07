from app import create_app
from app.database import db
app = create_app()
app.app_context().push()
from app.models.source import Source
from app.models.target import Target
from app.models.intent import Intent
from google.cloud import translate

file_name_out =  './data/target/ice-atis_translation.tsv'

def export():
	with open(file_name_out,'w') as fout:
		for s, t in db.session.query(Source, Target).filter(Source.target_id == Target.id, Target.is_completed == True, Target.tokens != None).all():
			fout.write(f'{s.tokens}\t{t.tokens}\n')


if __name__ == "__main__":
	export()