from googletrans import Translator
# Init Google Translate
translator = Translator()


# import os
# from google.cloud import translate
# client = translate.TranslationServiceClient()
# project_id = '404364630905'
# location = 'us-central1'
# model = 'projects/404364630905/locations/us-central1/models/TRL6302062000830676992'
# os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = os.path.join(os.curdir, 'credentials.json') 
# parent = client.location_path(project_id, location)


# def get_custom_translation(source_text):
#     text = source_text.strip()
#     response = client.translate_text(
#         parent=parent,
#         contents=[text],
#         model=model,
#         mime_type='text/plain',
#         source_language_code='en',
#         target_language_code='is')

#     for translation in response.translations:
#         return u"{}".format(translation.translated_text)
#         break


def get_translation(source_text):
    translation = translator.translate(text=source_text, src='en', dest='is')
    return translation.text

