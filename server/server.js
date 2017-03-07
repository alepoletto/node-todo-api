const express = require('express');
const bodyParser = require('body-parser');
const { ObjectId } = require('mongodb');
const _ = require('lodash');
const {mongoose} = require('./db');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');

let app = express();
const port = process.env.PORT || 3000;



app.use(bodyParser.json());

app.post('/todos', (req, res) => {
  let todo = new Todo({
    text: req.body.text
  });

  todo.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  })
});

app.get('/todos', (req, res) => {
  Todo.find().then((todos) => {
    res.send({
      todos
    }), (e) => {
      res.status(400).send(e);
    };
  });
});

app.get('/todos/:id', (req, res) => {
  let id = req.params.id;

  if(!ObjectId.isValid(id)) {
    res.status(404).send();
  }
  Todo.findById(id).then((todo) => {
    if(todo){
      res.send({
        todo
      });
    } else {
      res.status(404).send();
    }
  }).catch((e) => {
        res.status(400).send();
  });
});

app.delete('/todos/:id', (req, res) => {
  let id = req.params.id;

  if(!ObjectId.isValid(id)) {
    res.status(404).send();
  }
  Todo.findByIdAndRemove(id).then((todo) => {
    if(!todo){
      res.status(404).send();
    }
    res.send({todo});

  }).catch((e) => {
        res.status(400).send();
  });
});

app.patch('/todos/:id', (req, res) => {
  let id = req.params.id;

  let { text, completed } = req.body;

  if(!ObjectId.isValid(id)) {
    res.status(404).send();
  }
  let completedAt = null
  if(_.isBoolean(completed) && completed) {
    completedAt = new Date().getTime();
  } else {
    completed = false;
  }
  let updatedTodo = { completedAt, completed, text  };

  Todo.findByIdAndUpdate(id,{$set: updatedTodo}, {new:true} ).then((todo) => {
    if(!todo){
      res.status(404).send();
    }
    res.send({todo});

  }).catch((e) => {
        res.status(400).send();
  });

});

app.listen(port, () => {
  console.log(`started up at port ${port}`);
});


module.exports = { app };
