from database import database
from sqlalchemy import insert, select
from models import user_table
import os

async def seed_database():
    username = os.getenv('SEED_USER', 'default_username')
    password = os.getenv('SEED_PASSWORD', 'default_password')

    # Check if the user already exists
    query = select(user_table.c.username).where(user_table.c.username == username)
    existing_user = await database.fetch_one(query)

    if existing_user:
        print(f"User {username} already exists, seeding skipped.")
    else:
        # Insert the new user if it doesn't exist
        insert_query = insert(user_table).values(username=username, password=password)
        await database.execute(insert_query)
        print(f"User {username} seeded successfully.")