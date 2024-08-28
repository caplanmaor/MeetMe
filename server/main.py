from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from sqlalchemy import select
from typing import List
from database import database, engine
from models import metadata, status_table, user_table
from fastapi.middleware.cors import CORSMiddleware
import os
import json
import bcrypt
from datetime import datetime, timedelta
from seed import seed_database
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# get secret key from env or generate a strong key
SECRET_KEY = os.getenv('SECRET_KEY', os.urandom(32).hex())  # TODO: should be securely stored
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

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

async def get_current_user(token: str = Depends(OAuth2PasswordBearer(tokenUrl="token"))):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    query = select(user_table).where(user_table.c.username == username)
    user = await database.fetch_one(query)
    
    if user is None:
        raise credentials_exception

    return user

@app.get("/initial_statuses/")
async def get_initial_statuses(current_user: dict = Depends(get_current_user)):
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
async def update_status(user_id: int, status: str, current_user: dict = Depends(get_current_user)):
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

def verify_password(plain_password, hashed_password):
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire, "user_id": data["user_id"]})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def authenticate_user(username: str, password: str):
    query = select(user_table).where(user_table.c.username == username)
    user = await database.fetch_one(query)
    if not user or not verify_password(password, user['password']):
        return False
    return user

@app.post("/token")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["username"], "user_id": user["id"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}
