from database import database
from sqlalchemy import insert, select
from models import user_table
import os
import bcrypt

salt = bcrypt.gensalt()

async def seed_database():
    username_1 = os.getenv('SEED_USER_1', 'user1')
    username_2 = os.getenv('SEED_USER_2', 'user2')
    password = os.getenv('SEED_PASSWORD', '1234')
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

    existing_user_1 = await database.fetch_one(select(user_table.c.username).where(user_table.c.username == username_1))
    existing_user_2 = await database.fetch_one(select(user_table.c.username).where(user_table.c.username == username_2))

    if existing_user_1:
        print(f"User {username_1} already exists, seeding skipped.")
    else:
        insert_query = insert(user_table).values(username=username_1, password=hashed_password)
        await database.execute(insert_query)
        print(f"User {username_1} seeded successfully.")
    
    if existing_user_2:
        print(f"User {username_2} already exists, seeding skipped.")
    else:
        insert_query = insert(user_table).values(username=username_2, password=hashed_password)
        await database.execute(insert_query)
        print(f"User {username_2} seeded successfully.")

