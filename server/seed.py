from database import database
from sqlalchemy import insert, select
from models import user_table, status_table
import os
import bcrypt

salt = bcrypt.gensalt()

async def seed_database():
    print("Seeding database with example data")
    # env var users
    username_1 = os.getenv('SEED_USER_1', 'user1')
    username_2 = os.getenv('SEED_USER_2', 'user2')
    password = os.getenv('SEED_PASSWORD', '1234')
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

    # check if users already exist
    existing_user_1 = await database.fetch_one(select(user_table.c.username).where(user_table.c.username == username_1))
    existing_user_2 = await database.fetch_one(select(user_table.c.username).where(user_table.c.username == username_2))

    if existing_user_1:
        print(f"User {username_1} already exists, seeding skipped")
    else:
        await database.execute(insert(user_table).values(username=username_1, password=hashed_password))
        print(f"User {username_1} seeded successfully")
    
    if existing_user_2:
        print(f"User {username_2} already exists, seeding skipped")
    else:
        await database.execute(insert(user_table).values(username=username_2, password=hashed_password))
        print(f"User {username_2} seeded successfully")

    # hardcoded users and statuses as example data for testing
    example_users = [
        {"username": "Jim Morrison", "password": "1234", "status": "Working"},
        {"username": "Whitney Houston", "password": "1234", "status": "Working Remotely"},
        {"username": "John Lennon", "password": "1234", "status": "On Vacation"},
        {"username": "Mike Patton", "password": "1234", "status": "Business Trip"},
    ]

    for user in example_users:
        existing_user = await database.fetch_one(select(user_table.c.username).where(user_table.c.username == user["username"]))
        if existing_user:
            print(f"User {user['username']} already exists, seeding skipped")
        else:
            hashed_password = bcrypt.hashpw(user["password"].encode('utf-8'), salt).decode('utf-8')
            insert_query = insert(user_table).values(username=user["username"], password=hashed_password)
            user_id = await database.execute(insert_query)
            print(f"User {user['username']} seeded successfully")

            # create status for the user
            await database.execute(insert(status_table).values(user_id=user_id, status=user["status"]))
            print(f"Status for {user['username']} set to {user['status']}.")

