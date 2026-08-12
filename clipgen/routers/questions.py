from fastapi import APIRouter
from pydantic import BaseModel
from models import Question
import tempfile
import subprocess
import re

CORRECTNESS_THRESHOLD = 0.9

router = APIRouter()


class QuestionCreate(BaseModel):
    episode: str
    episodeName: str
    preClipFilename: str
    postClipFilename: str
    question: str
    answer: str
    second_clip_offset: int
    type: str

@router.post("")
async def save_question(qc: QuestionCreate):
    print("Hello")
    match = re.match(r"S(?P<season>\d+)E(?P<episode>\d+)", qc.episode)

    
    # todo date
    db_question = Question.create(
        season=int(match["season"]),
        episode_number=int(match["episode"]),
        episode_name=qc.episodeName,
        question=qc.question,
        answer=qc.answer,
        pre_clip_filename=qc.preClipFilename,
        post_clip_filename=qc.postClipFilename,
        post_clip_offset_ms=qc.second_clip_offset,
        type=qc.type
    )


        
            

