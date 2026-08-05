from peewee import *
from playhouse.pool import PooledPostgresqlDatabase
from dotenv import load_dotenv
import os

load_dotenv()

# 1. Initialize the PostgreSQL connection
db = PooledPostgresqlDatabase(
    'simpson',      # Name of your database
    user='postgres',    # Database user
    password=os.getenv("PG_PASSWORD"),
    host='localhost',
    port=os.getenv("DB_PORT"),
    max_connections=20,
    stale_timeout=300
)

     
