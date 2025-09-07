const request = require('supertest');
const app = require('../../server');

async function createPost(token, postData) {
  return await request(app)
    .post('/api/posts')
    .set('x-auth-token', token)
    .send(postData);
}

module.exports = { createPost };
