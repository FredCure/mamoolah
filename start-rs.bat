start "mongod rs0-0" mongod --replSet rs0 --port 27017 --dbpath C:\data\rs0-0
start "mongod rs0-1" mongod --replSet rs0 --port 27018 --dbpath C:\data\rs0-1
start "mongod rs0-2" mongod --replSet rs0 --port 27019 --dbpath C:\data\rs0-2