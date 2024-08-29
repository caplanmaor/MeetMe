# MeetMe 📖

### How to Run the Project
Clone the git repository

Navigate to the project's root directory and make sure you have a .env file with the following variables

```
POSTGRES_DB=team_status_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_HOST=db
POSTGRES_PORT=5432
AUTH_SECRET_KEY=secret_key_place_holder
SEED_USER_1=user1
SEED_USER_2=user2
SEED_PASSWORD=1234
```

run:

```sh
docker-compose up
```

### Test the Application

Open your browser and navigate to http://localhost:8000/
Login using the default credentials

```
username: user1
password: 1234
```

To see the WebSocket in action open another window in incognito mode (Ctrl + Shift + N) so you can use two accounts at the same time
Navigate to http://localhost:8000/ once again and log in with the second default user

```
username: user2
password: 1234
```

Update the status on each of the users and watch the immediate sync
