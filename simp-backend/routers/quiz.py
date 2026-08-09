from fastapi import APIRouter
from fastapi.responses import FileResponse
from fastapi.responses import StreamingResponse
from fastapi import BackgroundTasks
from difflib import SequenceMatcher
from pydantic import BaseModel
from models import Question
import string
from peewee import fn
from typing import Optional

router = APIRouter()

CORRECTNESS_THRESHOLD = 0.85



@router.get("")
async def get_quiz(questionID: Optional[str] = None):
    
    if(questionID):
        question = Question.get_by_id(questionID)
    else:
        question = (
            Question
            .select()
            .order_by(fn.Random())
            .first()
        )
    
    return {
        "questionID": question.id,
        "question": question.question,
        "video_url": question.pre_clip_filename,
    }
 

class Guess(BaseModel):
    questionID: int
    answer: str
    
@router.post("")
async def check_guess(guess: Guess):
    question=Question.get_by_id(guess.questionID)

    return {
        "questionID": question.id,
        "question": question.question,
        "answer": question.answer,
        "isCorrect": match_string(guess.answer, question.answer),
        "video_url": question.post_clip_filename,
        "offset": question.post_clip_offset_ms
    }
      
class episodeGuess(BaseModel):
    questionID: int
    episodeName: str
    
@router.post("/episode")
async def check_episode_guess(guess: episodeGuess):
    question=Question.get_by_id(guess.questionID)

    return {
        "answer": question.episode_name,
        "isCorrect": match_string(guess.episodeName, question.episode_name)
    }
    
    
def match_string(guess, answer):
    cleaned_guess = clean_string(guess)
    cleaned_answer = clean_string(answer)
    
    # in case person guesses too many lines
    if len(cleaned_guess) > len(cleaned_answer) + 3:
        cleaned_guess = cleaned_guess[0:len(cleaned_answer) + 3]
        
    score = SequenceMatcher(
        None,
        cleaned_guess,
        cleaned_answer
    ).ratio()
    
    return score > CORRECTNESS_THRESHOLD
    
    
def clean_string(s):
    return s.lower().translate(str.maketrans("", "", string.punctuation))
