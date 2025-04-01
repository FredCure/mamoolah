@echo off
echo Shutting down MongoDB replica set...

REM Shut down the first node
mongosh --port 27017 --eval "db.getSiblingDB('admin').shutdownServer()"

REM Shut down the second node
mongosh --port 27018 --eval "db.getSiblingDB('admin').shutdownServer()"

REM Shut down the third node
mongosh --port 27019 --eval "db.getSiblingDB('admin').shutdownServer()"

echo MongoDB replica set shut down successfully.