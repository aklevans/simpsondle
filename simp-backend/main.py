from fastapi import FastAPI
from contextlib import asynccontextmanager
from routers.quiz import router as quiz_router

from fastapi.middleware.cors import CORSMiddleware
from db_config import db
from models import Question
from mangum import Mangum

@asynccontextmanager
async def lifespan(app: FastAPI):
    with db:
        # safe=True appends "IF NOT EXISTS" to the raw SQL command
        db.create_tables([Question], safe=True)
    yield
    if not db.is_closed():
        db.close()


app = FastAPI(lifespan=lifespan)
app.include_router(quiz_router, prefix="/quiz",)



origins = [
    "http://localhost.tiangolo.com",
    "https://localhost.tiangolo.com",
    "http://localhost",
    "http://localhost:8080",
    "http://localhost:5173",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition", "simp-quiz-episode", "simp-quiz-index"],
)


def get_db():
    if db.is_closed():
        db.connect()
    try:
        yield
    finally:
        if not db.is_closed():
            db.close()
            
handler = Mangum(app)
