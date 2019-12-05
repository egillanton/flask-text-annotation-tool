from app import create_app, db
app = create_app()
app.app_context().push()
from app.models import Source, Target, Intent, Label

# -------- Source Files -------------------------------- #
test_fn = './data/source/atis.test.w-intent.iob'
train_fn = './data/source/atis.train.w-intent.iob'

# -------- Target Files -------------------------------- #
intents_fout =  './data/target/atis.dict.intent.txt'
slots_fout = './data/target/atis.dict.slots.txt'

intents_set = set()
slots_set = set()

# -------- Create Source -------------------------------- #
def create_source():
    with open(test_fn,'r') as fin:
        for line in fin:
            tokens, slots = line.split("\t")
            slots = slots.split(' ') 
            intent_name = slots[-1].strip()
            slots[-1] = "O"
            
            for s in slots:
                if s and s not in slots_set:
                    slots_set.add(s)
                    label = Label(label=s)
                    db.session.add(label)
            
            slots = ' '.join(slots).strip()

            if intent_name not in intents_set:
                intents_set.add(intent_name)
                intent = Intent(intent=intent_name)
                db.session.add(intent)
            else:
                intent = Intent.query.filter_by(intent=intent_name).first()
            target = Target(intent=intent, intent_id=intent.id)
            source = Source(tokens= tokens.strip().lower(), lables=slots, intent=intent, intent_id=intent.id, target=target, target_id=target.id)
            target.source = source
            target.source_id = source.id
            db.session.add(source)
            db.session.add(target)

    with open(train_fn,'r') as fin:
        for line in fin:
            tokens, slots = line.split("\t")
            slots = slots.split(' ') 
            intent_name = slots[-1].strip()
            slots[-1] = "O"
            
            for s in slots:
                if s and s not in slots_set:
                    slots_set.add(s)
                    label = Label(label=s)
                    db.session.add(label)

            slots = ' '.join(slots).strip()

            if intent_name not in intents_set:
                intents_set.add(intent_name)
                intent = Intent(intent=intent_name)
                db.session.add(intent)
            else:
                intent = Intent.query.filter_by(intent=intent_name).first()
            target = Target(intent=intent, intent_id=intent.id)
            source = Source(tokens= tokens.strip().lower(), lables=slots, intent=intent, intent_id=intent.id, target=target, target_id=target.id, training_set=True)
            target.source = source
            target.source_id = source.id
            target.training_set = True
            db.session.add(source)
            db.session.add(target)
    db.session.commit()

def save_sets():
    
    with open(intents_fout,'w') as fout:
        for intent in sorted(intents_set):
            fout.write(f'{intent}\n')

    with open(slots_fout,'w') as fout:
        for slot in sorted(slots_set):
            fout.write(f'{slot}\n')


if __name__ == "__main__":
    # Your first time? Run: '$ flask db migrate && flask db updgrade'
    db.drop_all() # Used to clear Database
    db.create_all()
    create_source()
    save_sets()
