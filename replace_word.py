import argparse
from app import create_app
from app.database import db
app = create_app()
app.app_context().push()
from app.models.target import Target

def replace(old, new):
    # Get targets that have tokens
    targets = Target.query.filter(Target.tokens != None).all()
    for target in targets:
        temp_str = target.tokens
        temp_str = temp_str.replace(old, new)
        target.tokens = temp_str

    db.session.commit()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Replace All single word in Target tokens')
    parser.add_argument('--old', dest='old', type=str)
    parser.add_argument('--new', dest='new', type=str)
    args = parser.parse_args()

    replace(args.old, args.new)