from app import create_app
from app.database import db
app = create_app()
app.app_context().push()
from app.models.source import Source
from app.models.target import Target
from app.models.intent import Intent

# -------- Target Files -------------------------------- #
test_fout =  './data/target/atis.test.w-intent.iob'
train_fout = './data/target/atis.train.w-intent.iob'

def export():
    completed_test_set = Target.query.filter(Target.is_completed == True, Target.tokens != None, Target.is_training_set == False ).all()
    completed_training_set = Target.query.filter(Target.is_completed == True, Target.tokens != None, Target.is_training_set == True ).all()
    

    with open(test_fout,'w') as fout:
        for sample in completed_test_set:
            fout.write(f'{sample.tokens}\t{sample.labels}\t{sample.intent.intent}\n')

    with open(train_fout,'w') as fout:
        for sample in completed_training_set:
            fout.write(f'{sample.tokens}\t{sample.labels}\t{sample.intent.intent}\n')


if __name__ == "__main__":
    export()