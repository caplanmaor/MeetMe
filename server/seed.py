from database import database
from sqlalchemy import insert, select
from models import user_table
import os
import bcrypt

salt = bcrypt.gensalt()

async def seed_database():
    username = os.getenv('SEED_USER', 'default_username')
    password = os.getenv('SEED_PASSWORD', 'default_password')
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

    query = select(user_table.c.username).where(user_table.c.username == username)
    existing_user = await database.fetch_one(query)

    if existing_user:
        print(f"User {username} already exists, seeding skipped.")
    else:
        insert_query = insert(user_table).values(username=username, password=hashed_password)
        await database.execute(insert_query)
        print(f"User {username} seeded successfully.")
