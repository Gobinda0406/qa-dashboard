const { registerUser, loginUser } = require('./utils/authUtils');
const { createPost } = require('./utils/postUtils');
const posts = require('./data/posts');
const users = require('./data/users');
const request = require('supertest');
const app = require('../server');

let token = '';
let postId = '';

describe('Posts API', () => {
  beforeAll(async () => {
    await registerUser(users.validUser);
    const res = await loginUser({
      email: users.validUser.email,
      password: users.validUser.password,
    });
    token = res.body.token;
  });

  afterAll(async () => {
    // Clean up users and posts collections after tests
    const mongoose = require('mongoose');
    await mongoose.connection.dropCollection('users').catch(() => {});
    await mongoose.connection.dropCollection('posts').catch(() => {});
    await mongoose.connection.close();
  });

  it('should create a post', async () => {
    const res = await createPost(token, posts.validPost);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('text', posts.validPost.text);
    postId = res.body._id;
  });

  it('should get all posts', async () => {
    const res = await request(app).get('/api/posts').set('x-auth-token', token);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should get post by id', async () => {
    const res = await request(app)
      .get(`/api/posts/${postId}`)
      .set('x-auth-token', token);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('_id', postId);
  });

  // Add more post CRUD, like, comment tests as needed...
});
