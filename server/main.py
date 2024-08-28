from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from sqlalchemy import select
from typing import List
from database import database, engine
from models import metadata, status_table
from seed import seed_database
from fastapi.middleware.cors import CORSMiddleware
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

@app.on_event("startup")
async def startup_event():
    # connect to the database and create tables
    await database.connect()
    metadata.create_all(engine)
    # seed example data for testing
    await seed_database()

@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()

@app.get("/initial_statuses/")
async def get_initial_statuses():
    query = select(status_table.c.user_id, status_table.c.status)
    initial_statuses = await database.fetch_all(query)
    return [{"user_id": status["user_id"], "status": status["status"]} for status in initial_statuses]

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    
    try:
        while True:
            data = await websocket.receive_text()
            await manager.broadcast(data)
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.post("/update_status/")
async def update_status(user_id: int, status: str):
    # check if the user already has a status    
    query = select(status_table.c.user_id).where(status_table.c.user_id == user_id)
    existing_status = await database.fetch_one(query)
    
    # if they do, update it, otherwise insert a new status
    if existing_status:
        update_query = status_table.update().where(status_table.c.user_id == user_id).values(status=status)
    else:
        update_query = status_table.insert().values(user_id=user_id, status=status)
    
    await database.execute(update_query)
    
    # broadcast the new status to all connected websocket clients
    update_message = json.dumps({"user_id": user_id, "status": status})
    await manager.broadcast(update_message)