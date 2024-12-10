const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional tests', function() {
  let testId;

  suite('POST /api/books with title => create book object/expect book object', function() {

      test('Test POST /api/books with title', function(done) {
          chai.request(server)
              .post('/api/books')
              .send({ title: 'Test Book' })
              .end(function(err, res) {
                  assert.equal(res.status, 200);
                  assert.property(res.body, '_id');
                  assert.property(res.body, 'title');
                  assert.equal(res.body.title, 'Test Book');
                  testId = res.body._id;  // Save the book ID for future tests
                  done();
              });
      });

      test('Test POST /api/books with no title given', function(done) {
          chai.request(server)
              .post('/api/books')
              .send({})
              .end(function(err, res) {
                  assert.equal(res.text, 'missing required field title');
                  done();
              });
      });
  });

  suite('GET /api/books => array of books', function() {

      test('Test GET /api/books', function(done) {
          chai.request(server)
              .get('/api/books')
              .end(function(err, res) {
                  assert.equal(res.status, 200);
                  assert.isArray(res.body);
                  done();
              });
      });
  });

  suite('GET /api/books/[id] => book object with [id]', function() {

      test('Test GET /api/books/[id] with id not in db', function(done) {
          chai.request(server)
              .get('/api/books/invalidId')
              .end(function(err, res) {
                  assert.equal(res.status, 404);
                  assert.equal(res.text, 'no book exists');
                  done();
              });
      });

      test('Test GET /api/books/[id] with valid id in db', function(done) {
          chai.request(server)
              .get(`/api/books/${testId}`)
              .end(function(err, res) {
                  assert.equal(res.status, 200);
                  assert.property(res.body, '_id');
                  assert.property(res.body, 'title');
                  assert.property(res.body, 'comments');
                  done();
              });
      });
  });

  suite('POST /api/books/[id] => add comment/expect book object with id', function() {

      test('Test POST /api/books/[id] with comment', function(done) {
          chai.request(server)
              .post(`/api/books/${testId}`)
              .send({ comment: 'Great book!' })
              .end(function(err, res) {
                  assert.equal(res.status, 200);
                  assert.property(res.body, 'comments');
                  assert.include(res.body.comments, 'Great book!');
                  done();
              });
      });

      test('Test POST /api/books/[id] without comment field', function(done) {
          chai.request(server)
              .post(`/api/books/${testId}`)
              .send({})
              .end(function(err, res) {
                  //assert.equal(res.status, 400);  // Status should be 400 for missing fields
                  assert.equal(res.text, 'missing required field comment');
                  done();
              });
      });

      test('Test POST /api/books/[id] with comment, id not in db', function(done) {
          chai.request(server)
              .post('/api/books/invalidId')
              .send({ comment: 'Great book!' })
              .end(function(err, res) {
                  assert.equal(res.status, 404);
                  assert.equal(res.text, 'no book exists');
                  done();
              });
      });
  });

  suite('DELETE /api/books/[id] => delete book object id', function() {

      test('Test DELETE /api/books/[id] with valid id in db', function(done) {
          chai.request(server)
              .delete(`/api/books/${testId}`)
              .end(function(err, res) {
                  assert.equal(res.status, 200);
                  assert.equal(res.text, 'delete successful');
                  done();
              });
      });

      test('Test DELETE /api/books/[id] with id not in db', function(done) {
          chai.request(server)
              .delete('/api/books/invalidId')
              .end(function(err, res) {
                  assert.equal(res.status, 404);
                  assert.equal(res.text, 'no book exists');
                  done();
              });
      });

  });

  suite('DELETE /api/books => delete all books', function() {

      test('Test DELETE /api/books to delete all books', function(done) {
          chai.request(server)
              .delete('/api/books')
              .end(function(err, res) {
                  assert.equal(res.status, 200);
                  assert.equal(res.text, 'complete delete successful');
                  done();
              });
      });
  });
});
