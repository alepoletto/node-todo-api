require('./config/config');

const express = require('express');
const bodyParser = require('body-parser');
const { ObjectId } = require('mongodb');
const _ = require('lodash');
const {mongoose} = require('./db');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');

const {authenticated} = require('./middleware/authenticate');

let app = express();
const port = process.env.PORT;

app.use(bodyParser.json());

app.post('/todos', authenticated, (req, res) => {
  let todo = new Todo({
    text: req.body.text,
    _creator: req.user._id
  });

  todo.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  })
});

app.get('/todos', authenticated, (req, res) => {
  Todo.find({_creator: req.user._id}).then((todos) => {
    res.send({
      todos
    }), (e) => {
      res.status(400).send(e);
    };
  });
});

app.get('/todos/:id', authenticated, (req, res) => {
  let id = req.params.id;

  if(!ObjectId.isValid(id)) {
    res.status(404).send();
  }
  Todo.findOne({
    _id: id,
    _creator: req.user._id}).then((todo) => {
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

app.delete('/todos/:id',authenticated, (req, res) => {
  let id = req.params.id;

  if(!ObjectId.isValid(id)) {
    res.status(404).send();
  }
  Todo.findOneAndRemove({
  _id: id,
  _creator: req.user._id}).then((todo) => {
    if(!todo){
      res.status(404).send();
    }
    res.send({todo});

  }).catch((e) => {
        res.status(400).send();
  });
});

app.patch('/todos/:id', authenticated, (req, res) => {
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

  Todo.findOneAndUpdate({_id:id, _creator: req.user._id},{$set: updatedTodo}, {new:true} ).then((todo) => {
    if(!todo){
      res.status(404).send();
    }
    res.send({todo});

  }).catch((e) => {
        res.status(400).send();
  });

});

app.post('/users', (req, res) => {

  let {email, password} = req.body;

  if(!email || !password) {
    res.status(400).send();
    return;
  }
  let user = new User({email, password});
  user.save().then(() => {
    return user.generateAuthToken();
  }).then((token) => {
    res.header('x-auth', token).send(user);
  }).catch((e) => {
    res.status(400).send(e);
  });

});



app.get('/users/me', authenticated, (req, res) => {
  res.send(req.user);
});

app.delete('/users/me/token', authenticated, (req, res) => {
  req.user.removeToken(req.token).then(() => {
    res.status(200).send();
  });
});

app.post('/users/login', (req, res) => {
  let {email, password} = req.body;

  if(!email || !password) {
    res.status(400).send();
    return;
  }

  User.findByCredentials(email, password).then((user) => {
    user.generateAuthToken().then((token) => {
      res.header('x-auth', token).send(user);
    });
  }).catch((e) => {
    res.status(400).send();
  });

});


app.listen(port, () => {
  console.log(`started up at port ${port}`);
});


module.exports = { app };
