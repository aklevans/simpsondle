from peewee import *

from db_config import db 

class BaseModel(Model):
    class Meta:
        database=db

class Question(BaseModel):
    season=IntegerField()
    episode_number=IntegerField()
    episode_name=CharField()
    date=DateField(null=True)
    question=CharField()
    answer=CharField()
    pre_clip_filename=CharField()
    post_clip_filename=CharField()
    post_clip_offset_ms=IntegerField()
    
