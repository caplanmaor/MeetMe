from fastapi import FastAPI, WebSocket
from typing import List
from database import database, engine
from models import metadata
from seed import seed_database

app = FastAPI()

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

@app.on_event("startup")
async def startup_event():
    await database.connect()
    metadata.create_all(engine)
    await seed_database()

@app.post("/update_status/")
async def update_status(user_id: int, status: str):
    # TODO: Update the status of the user in the database
    return {"status": "success"}