from peewee import *
from playhouse.pool import PooledPostgresqlDatabase
from dotenv import load_dotenv
import os

load_dotenv()

# Pooled connection, but capped small: each Lambda execution environment
# only ever handles one request at a time, so a large pool just opens
# more connections than the DB needs. Pooling still pays off across warm
# invocations within the same execution environment.
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
