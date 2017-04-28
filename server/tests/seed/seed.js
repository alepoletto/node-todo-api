const {ObjectId} = require('mongodb');
const jwt = require('jsonwebtoken');
const {Todo} = require('./../../models/todo');
const {User} = require('./../../models/user');

const userOneId = new ObjectId();
const userTwoId = new ObjectId();

const users = [{
  _id: userOneId,
  email: 'alexandrepoletto@gmail.com',
  password: 'UserOnePass',
  tokens: [{
    acess: 'auth',
    token: jwt.sign({_id: userOneId, acess: 'auth'}, process.env.JWT_SECRET).toString()
  }]
}, {
  _id: userTwoId,
  email: 'alexandre.poletto@ilegra.com',
  password: 'UserTwoPass',
  tokens: [{
    acess: 'auth',
    token: jwt.sign({_id: userTwoId, acess: 'auth'}, process.env.JWT_SECRET).toString()
  }]
}]

const populateUsers = (done) => {
  User.remove({}).then(() => {
    var userOne = new User(users[0]).save();
    var userTwo = new User(users[1]).save();

    return Promise.all([userOne,userTwo]);
  }).then(() => done())
}

const todos = [{
  _id: new ObjectId(),
  text: 'First test todo',
  _creator: userOneId
}, {
  _id: new ObjectId(),
  text: 'Second test todo',
  _creator: userTwoId
}]

const populateTodos = (done) => {
  Todo.remove({}).then(() => {
    Todo.insertMany(todos);
  }).then(() => done());
}


module.exports = {todos, populateTodos, users, populateUsers};
