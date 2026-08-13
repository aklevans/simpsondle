from peewee import *
from playhouse.pool import PooledPostgresqlDatabase
from dotenv import load_dotenv
import os

load_dotenv()

# 1. Initialize the PostgreSQL connection
db = PooledPostgresqlDatabase(
    os.getenv("DB_NAME", "simpson"),
    user=os.getenv("DB_USER", "postgres"),
    password=os.getenv("DB_PASSWORD"),
    host=os.getenv("DB_HOST", "localhost"),
    port=int(os.getenv("DB_PORT", "5432")),
    max_connections=int(os.getenv("DB_POOL_MAX_CONNECTIONS", "1")),
    stale_timeout=300,
    sslmode=os.getenv("DB_SSLMODE", "prefer"),
)

     
