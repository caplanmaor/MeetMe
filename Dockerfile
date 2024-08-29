# Stage 1: Build React app
FROM node:18-alpine AS frontend-build

WORKDIR /app

# Copy the client folder to the Docker container
COPY client/package.json client/package-lock.json ./
RUN npm install

COPY client ./
RUN npm run build

# Stage 2: Build FastAPI app
FROM python:3.10-slim

WORKDIR /app

# Copy the requirements and install the dependencies
COPY server/requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the FastAPI code
COPY server .

# Copy the build output from the frontend stage
COPY --from=frontend-build /app/build ./client/build

# Command to run FastAPI
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
