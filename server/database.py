from databases import Database
from sqlalchemy import create_engine
import os

db_name = os.getenv('POSTGRES_DB', 'team_status_db')
db_user = os.getenv('POSTGRES_USER', 'postgres')
db_password = os.getenv('POSTGRES_PASSWORD', 'postgres')
db_host = os.getenv('POSTGRES_HOST', 'localhost')
db_port = os.getenv('POSTGRES_PORT', '5432')

DATABASE_URL = f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"

database = Database(DATABASE_URL)
engine = create_engine(DATABASE_URL)