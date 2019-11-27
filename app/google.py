from googletrans import Translator

# Init Google Translate
translator = Translator()

def get_translation(source_text):
    translation = translator.translate(text=source_text, src='en', dest='is')
    return translation.text

