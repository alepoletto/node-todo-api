const expect = require('chai').expect;
const request = require('supertest');
const { ObjectId} = require('mongodb');

const { app } = require('../server');
const { Todo } = require('../models/todo');

const todos = [{
  _id: new ObjectId(),
  text: 'First test todo'
}, {
  _id: new ObjectId(),
  text: 'Second test todo'
}]

describe('POST /todos', () => {
  beforeEach((done) => {
    Todo.remove({}).then(() => {
      Todo.insertMany(todos);
    }).then(() => done());
  })

  it('should create a new TODO', (done) => {
    let text = 'Test todo text';
    request(app)
    .post('/todos')
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
    .expect(200)
    .expect((res) => {
      expect(res.body.todos).to.have.lengthOf(2);
    })
    .end(done);
  });
})

describe('GET /todos/:id', () => {
  it('should return a new todo', (done) => {
    request(app)
      	.get(`/todos/${todos[0]._id.toHexString()}`)
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
        .expect(404)
        .end(done);
  });


  it('should return a 404 for non-object ids', (done) => {
    request(app)
      	.get(`/todos/123`)
        .expect(404)
        .end(done);
  });
})


describe('DELETE /todos/:id', () => {
  it('should remove a todo', (done) => {
    let hexId = todos[1]._id.toHexString();

    request(app)
    .delete(`/todos/${hexId}`)
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
        .expect(404)
        .end(done);
  });

  it('should return 404 if objectId is invalid', (done) => {
    request(app)
        .get(`/todos/123`)
        .expect(404)
        .end(done);
  });

})
