const expect = require('chai').expect;
const request = require('supertest');

const { app } = require('../server');
const { Todo } = require('../models/todo');



describe('POST /todos', () => {
  beforeEach((done) => {
    Todo.remove({}).then(() => done());
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

      Todo.find().then((todos) => {
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
        expect(todos).to.have.lengthOf(0);
        done();
      }).catch((e) => done(e))
    })
  })
});
