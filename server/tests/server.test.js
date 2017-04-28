const expect = require('chai').expect;
const request = require('supertest');
const { ObjectId} = require('mongodb');

const { app } = require('../server');
const { Todo } = require('../models/todo');
const {User} = require('../models/user');
const { todos, populateTodos, users, populateUsers} = require('./seed/seed');


beforeEach(populateUsers);
beforeEach(populateTodos);


describe('POST /todos', () => {

  it('should create a new TODO', (done) => {
    let text = 'Test todo text';
    request(app)
    .post('/todos')
    .set('x-auth', users[0].tokens[0].token)
    .send({ text })
    .expect(200)
    .expect((res) => {
      expect(res.body.text).to.equal(text);
    })
    .end((err, res) => {
      if(err) {
        return done(err);
      }

      Todo.find({text}).then((todos) => {
        expect(todos).to.have.lengthOf(1);
        expect(todos[0].text).to.equal(text);
        done();
      }).catch((e) => done(e))
    })
  });

  it('should not create todo with invalid body data', (done) => {
    request(app)
    .post('/todos')
    .set('x-auth', users[0].tokens[0].token)
    .send({  })
    .expect(400)
    .end((err, res) => {
      if(err) {
        return done(err);
      }

      Todo.find().then((todos) => {
        expect(todos).to.have.lengthOf(2);
        done();
      }).catch((e) => done(e))
    })
  })
});

describe('GET /todos', () => {
  it('should get all todos', (done) => {
    request(app)
    .get('/todos')
    .set('x-auth', users[0].tokens[0].token)
    .expect(200)
    .expect((res) => {
      expect(res.body.todos).to.have.lengthOf(1);
    })
    .end(done);
  });
})

describe('GET /todos/:id', () => {
  it('should return a new todo', (done) => {
    request(app)
      	.get(`/todos/${todos[0]._id.toHexString()}`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .expect((res) => {
          expect(res.body.todo.text).to.equal('First test todo');
        })
        .end(done);
  });

  it('should return a 404 if not found', (done) => {
    let newID = new ObjectId();
    request(app)
      	.get(`/todos/${newID.toHexString()}`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(404)
        .end(done);
  });


  it('should return a 404 for non-object ids', (done) => {
    request(app)
      	.get(`/todos/123`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(404)
        .end(done);
  });

  it('should not return a new todo doc create by another user', (done) => {
    request(app)
      	.get(`/todos/${todos[1]._id.toHexString()}`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(404)
        .end(done);
  });
})


describe('PATCH /todos/:id', () => {
  it('should update  a todo', (done) => {
    let hexId = todos[0]._id.toHexString();

    request(app)
    .patch(`/todos/${hexId}`)
    .set('x-auth', users[0].tokens[0].token)
    .send({
      text: 'ola',
      completed: true
    })
    .expect(200)
    .expect((res) => {
      expect(res.body.todo.text).to.equal('ola');
      expect(res.body.todo.completed).to.be.true;
      expect(res.body.todo.completedAt).to.be.a.number;
    })
    .end(done);

  });

  it('should clear completedAt when todo is not completed', (done) => {
    let hexId = todos[1]._id.toHexString();
    request(app)
    .patch(`/todos/${hexId}`)
    .set('x-auth', users[1].tokens[0].token)
    .send({
      text: 'ola 2',
      completed: false
    })
    .expect(200)
    .expect((res) => {
      expect(res.body.todo.text).to.equal('ola 2');
      expect(res.body.todo.completed).to.be.false;
      expect(res.body.todo.completedAt).to.not.exist;
    })
    .end(done);

  });

  it('should not update a todo that is not yours', (done) => {
    let hexId = todos[0]._id.toHexString();

    request(app)
    .patch(`/todos/${hexId}`)
    .set('x-auth', users[1].tokens[0].token)
    .send({
      text: 'ola',
      completed: true
    })
    .expect(404)
    .end(done);

  });

  });

  describe('DELETE /todos/:id', () => {
    it('should remove a todo', (done) => {
      let hexId = todos[1]._id.toHexString();

      request(app)
      .delete(`/todos/${hexId}`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo._id).to.equal(hexId);
      })
      .end((err, res) => {
        if(err) {
          return done(err);
        }

        Todo.findById(hexId).then((todo) => {
          expect(todo).to.not.exist;
          done();
        }).catch((e) => done(e))

      });

    });

    it('should return 404 if todo not found', (done) => {
      let newID = new ObjectId();
      request(app)
          .delete(`/todos/${newID.toHexString()}`)
          .set('x-auth', users[1].tokens[0].token)
          .expect(404)
          .end(done);
    });

    it('should return 404 if objectId is invalid', (done) => {
      request(app)
          .get(`/todos/123`)
          .set('x-auth', users[1].tokens[0].token)
          .expect(404)
          .end(done);
    });

    it('should not remove a todo that you dont own', (done) => {
      let hexId = todos[0]._id.toHexString();

      request(app)
      .delete(`/todos/${hexId}`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)
      .end((err, res) => {
        if(err) {
          return done(err);
        }

        Todo.findById(hexId).then((todo) => {
          expect(todo).to.exist;
          done();
        }).catch((e) => done(e))

      });

    });

  });


  describe('GET /users/me', () => {

    it('should return user if authenticated', (done) => {
      request(app)
        .get('/users/me')
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .expect((res) => {
          expect(res.body._id).to.equal(users[0]._id.toHexString());
          expect(res.body.email).to.equal(users[0].email);
        })
        .end(done);
    });

    it('should return 401 if not authenticated', (done) => {
      request(app)
        .get('/users/me')
        .expect(401)
        .end(done);
    });


  });


  describe('POST /users', function () {

    it('should create a user', (done) => {
      var email = 'example@example.com';
      var password = '123mnb!';

      request(app)
        .post('/users')
        .send({email,password})
        .expect(200)
        .expect((res) => {
          expect(res.headers['x-auth']).to.exist;
          expect(res.body._id).to.exist;
          expect(res.body.email).to.equal(email);
        })
        .end((err) => {
          if(err) {
            return done(err);
          }

          User.findOne({email}).then((user) => {
            expect(user).to.exist;
            expect(user.password).to.not.equal(password);
            done();
          }).catch((e) => done(e));
        });
    });

    it('should return validation errors if request invalid', (done) => {
      request(app)
        .post('/users')
        .send({
          email: 'and',
          password: '123'
        })
        .expect(400)
        .end(done);
    });

    it('should not create user  if email in use', (done) => {

      request(app)
        .post('/users')
        .send({
          email: users[0].email,
          password: users[0].password
        })
        .expect(400)
        .end(done);

    });

  describe('POST /users/login', () => {

    it('should login user and return auth token', (done) => {
      request(app)
        .post('/users/login')
        .send({
          email: users[1].email,
          password: users[1].password
        })
        .expect(200)
        .expect((res) => {
          expect(res.headers['x-auth']).to.exist;
        })
        .end((err, res) => {
          if(err) {
            return done(err);
          }

          User.findById(users[1]._id).then((user) => {
            expect(user.tokens[1]).to.include({
              acess: 'auth',
              token: res.headers['x-auth']
            });
            done()
          }).catch((e) => done(e));
        })
    });

    it('should reject invalid login', (done) => {
      request(app)
        .post('/users/login')
        .send({
          email: users[1].email,
          password: 'lalalala'
        })
        .expect(400)
        .expect((res) => {
          expect(res.headers['x-auth']).to.not.exist;
        })
        .end((err, res) => {
          if(err) {
            return done(err);
          }

          User.findById(users[1]._id).then((user) => {
            expect(user.tokens).to.have.lengthOf(1);
            done()
          }).catch((e) => done(e));
        })
    });
  })


  });
