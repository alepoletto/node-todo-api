# node-todo-api

this is a todo api made in nodejs using mongodb and jwt auth. Ths was created to lean how to use jwt and mongo to secure a node api application

## Install
to install follow these steps:

1. clone this repository
2. go to the project folder and execute the follow command:

```
npm install
```
you will need to create a config.json inside the config folder in the follow format

```
{
  "test": {
    "PORT": YOUR_PORT,
    "MONGODB_URI": "YOUR_MONGDB_URL",
    "JWT_SECRET": "A_STRING_WITH_YOUR_JWT_SECRET"
  },
  "development": {
    "PORT": YOUR_PORT,
    "MONGODB_URI": "YOUR_MONGDB_URL",
    "JWT_SECRET": "A_STRING_WITH_YOUR_JWT_SECRET"
  }
}
```

## How to use:

run the follow command:

```
npm start
```

that will start a local node server in the port specified 
