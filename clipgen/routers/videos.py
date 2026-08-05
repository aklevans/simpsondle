from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from fastapi.responses import StreamingResponse
from fastapi import BackgroundTasks
from difflib import SequenceMatcher
from pydantic import BaseModel
import boto3
from botocore.config import Config
from botocore.exceptions import BotoCoreError, ClientError

import os

import tempfile
import requests
import json
import subprocess
import random


router = APIRouter()

R2_ACCOUNT_ID = os.getenv("R2_ACCOUNT_ID")
R2_ACCESS_KEY_ID = os.getenv("R2_ACCESS_KEY_ID")
R2_SECRET_ACCESS_KEY = os.getenv("R2_SECRET_ACCESS_KEY")
R2_BUCKET_NAME = os.getenv("R2_BUCKET_NAME")


def get_r2_client():
    return boto3.client(
        "s3",
        endpoint_url=f"https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com",
        aws_access_key_id=R2_ACCESS_KEY_ID,
        aws_secret_access_key=R2_SECRET_ACCESS_KEY,
        config=Config(signature_version="s3v4"),
        region_name="auto",
    )

def ms_to_timestamp(ms):
    # ms = ms - 1000
    seconds = ms // 1000

    hours = seconds // 3600
    minutes = (seconds % 3600) // 60
    seconds = seconds % 60

    return f"{hours:02d}:{minutes:02d}:{seconds:02d}"




def get_audio_video(episode, startTimestamp, endTimestamp):
    output_path = f"{episode}-{startTimestamp}-{endTimestamp}.mp4"
    startTime = (startTimestamp / 1000)
    endTime = endTimestamp / 1000
    video_file=f"D:\simpson\{episode}.mp4"
    duration = endTime - startTime
    
    subprocess.run([
        "ffmpeg",
        "-y",
        "-ss", str(startTime),
        "-i", video_file,
        "-t", str(duration),
        "-c:v", "libx264",
        "-c:a", "aac",
        "-movflags", "+faststart",
        output_path
    ], check=True)
    
    return output_path
    

    
@router.get("/{episode}/{start}/{end}")
async def get_random(episode: str, start: int, end: int, background_tasks: BackgroundTasks):
    output_path =  get_audio_video(episode, start, end)

    return FileResponse(
        output_path,
        media_type="video/mp4",
        filename="episode.mp4"
    )


class SaveClip(BaseModel):
    filename: str


@router.post("/save")
async def save_clip_to_r2(clip: SaveClip):
    if not all([R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME]):
        raise HTTPException(status_code=500, detail="R2 is not configured on the server")
    try:
        
        get_r2_client().upload_file(
            clip.filename,
            R2_BUCKET_NAME,
            clip.filename,
            ExtraArgs={"ContentType": "video/mp4"},
        )
    except (BotoCoreError, ClientError) as e:
        raise HTTPException(status_code=502, detail=f"Failed to upload to R2: {e}")
    finally:
        os.remove(clip.filename)

    return {"filename": clip.filename}


