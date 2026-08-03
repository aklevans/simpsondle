from faster_whisper import WhisperModel
from mutagen.mp3 import MP3
import requests
import subprocess 

from difflib import SequenceMatcher

import sys

sys.stdout.reconfigure(encoding="utf-8")


# -----------------------
# Configuration
# -----------------------



def ms_to_timestamp(ms):
    # ms = ms - 1000
    seconds = ms // 1000

    hours = seconds // 3600
    minutes = (seconds % 3600) // 60
    seconds = seconds % 60

    return f"{hours:02d}:{minutes:02d}:{seconds:02d}"



from pathlib import Path



        

testfile=open("test.txt", "w")
def getOffset(episode):

    response = requests.get(f"https://frinkiac.com/api/episode/{episode}/0/99999999")
    subtitles = response.json()["Subtitles"]

    
    chosenSubtitle = subtitles[int(len(subtitles) / 2)]


    clip_start_millis = chosenSubtitle["StartTimestamp"] - 30000
    audio_start_time = ms_to_timestamp(clip_start_millis)
    audio_end_time = ms_to_timestamp(chosenSubtitle["EndTimestamp"] + 30000)



    subprocess.run([
        "ffmpeg",
        "-ss", audio_start_time,
        "-to", audio_end_time,
        "-i", f"../simp-backend/audio/{episode}.mp3",
        "-c", "copy",
        "-y",
        "clip.mp3"
    ])

    # -----------------------
    # Get audio duration
    # -----------------------

    audio = MP3("clip.mp3")


    # -----------------------
    # Load Whisper model
    # -----------------------

    model = WhisperModel(
        "small",
        device="cpu",      # Change to "cuda" if using NVIDIA
        compute_type="int8"
    )

    # -----------------------
    # Transcribe
    # -----------------------

    # segments, info = model.transcribe(
    #     "clip.mp3",
    #     word_timestamps=True
    # )
    
    
    segments, info = model.transcribe(
        f"../simp-backend/audio/{episode}.mp3",
        word_timestamps=True
    )

    segments = list(segments)


    # print(episode)
    target = chosenSubtitle["Content"].lower().split()

    best = None
    best_score = 0

    all_words=[]
    for segment in segments:
        for word in segment.words:
            clean_word = word.word.strip(".,!?;:\"'()[]{}").lower()

            all_words.append({
                "word": clean_word,
                "start": word.start
            })

    # print(target)
    # print(audio_start_time)
    # Compare every possible window
    for i in range(len(all_words)):
        for length in range(max(1, len(target)-2), len(target)+3):

            if i + length > len(all_words):
                continue

            candidate_words = [
                w["word"] for w in all_words[i:i+length]
            ]

            candidate = " ".join(candidate_words)

            score = SequenceMatcher(
                None,
                " ".join(target),
                candidate
            ).ratio()

           

            if score > best_score:
                best_score = score
                best = (
                    all_words[i]["start"],
                    candidate,
                    score
                )

    print(episode, file=testfile, flush=True)
    print(best, file=testfile, flush=True)
    print("target", target, file=testfile, flush=True)
    print("", file=testfile, flush=True)
    subtitle_start,_,_ = best

    subtitle_start = int(subtitle_start * 1000)
    
    # print("subtitle_start", subtitle_start)
    # print("subtitle_start_timestamp", ms_to_timestamp(int(subtitle_start)))
    
    
    print("clip_start_millis", clip_start_millis)
    print("clip_start_timestamp", ms_to_timestamp(clip_start_millis))
    print("audio_start_time", audio_start_time)


    print("match_start_timestamp", ms_to_timestamp(clip_start_millis + subtitle_start))

    print("frinkiac start time", ms_to_timestamp(chosenSubtitle["StartTimestamp"]))



    # return  (int((clip_start_millis + subtitle_start) - chosenSubtitle["StartTimestamp"]), clip_start_millis + subtitle_start)

    return (int(subtitle_start - chosenSubtitle["StartTimestamp"]), subtitle_start)


directory_path = Path("../simp-backend/audio")

# Loop through items and filter for files

import csv

done=set()
outfile=open("offsets.csv", "r")
reader=csv.DictReader(outfile)
for row in reader:
    done.add(row["episode"])
outfile.close()




outfile=open("offsets.csv", "a")

for path in directory_path.iterdir():
    if path.is_file():
        episode = path.name.split(".mp3")[0]
        if(episode in done):
            continue
        offset, timestamp = getOffset(episode)
        
        print(f"{episode},{offset},{timestamp}", file=outfile, flush=True)
        
        

