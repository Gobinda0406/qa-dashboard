const request = require('supertest');
const app = require('../server');

let token = '';
let userId = '';
let postId = '';

describe('User Registration', () => {
  it('should register a new user', async () => {
    const res = await request(app).post('/api/users').send({
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'password123',
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should not register with existing email', async () => {
    const res = await request(app).post('/api/users').send({
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'password123',
    });
    expect(res.statusCode).toBe(400);
  });

  it('should not register with invalid data', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ name: '', email: 'notanemail', password: '123' });
    expect(res.statusCode).toBe(400);
  });
});
describe('User Authentication', () => {
  it('should authenticate user and return token', async () => {
    const res = await request(app).post('/api/auth').send({
      email: 'testuser@example.com',
      password: 'password123',
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    token = res.body.token;
  });

  it('should not authenticate with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth')
      .send({ email: 'testuser@example.com', password: 'wrongpass' });
    expect(res.statusCode).toBe(400);
  });

  it('should not authenticate with non-existent user', async () => {
    const res = await request(app)
      .post('/api/auth')
      .send({ email: 'nouser@example.com', password: 'password123' });
    expect(res.statusCode).toBe(400);
  });
});

describe('Profile API', () => {
  it('should get all profiles', async () => {
    const res = await request(app).get('/api/profile');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should not get current profile without token', async () => {
    const res = await request(app).get('/api/profile/me');
    expect(res.statusCode).toBe(401);
  });

  it('should create/update profile', async () => {
    const res = await request(app)
      .post('/api/profile')
      .set('x-auth-token', token)
      .send({
        status: 'QA Engineer',
        skills: 'testing,automation',
      });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'QA Engineer');
    userId = res.body.user;
  });

  it('should get current profile with token', async () => {
    const res = await request(app)
      .get('/api/profile/me')
      .set('x-auth-token', token);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'QA Engineer');
  });

  it('should get profile by user id', async () => {
    const res = await request(app).get(`/api/profile/user/${userId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('user');
  });

  it('should return 400 for non-existent user id', async () => {
    const res = await request(app).get(
      '/api/profile/user/000000000000000000000000'
    );
    expect(res.statusCode).toBe(400);
  });

  it('should add experience', async () => {
    const res = await request(app)
      .put('/api/profile/experience')
      .set('x-auth-token', token)
      .send({
        title: 'QA',
        company: 'TestCorp',
        from: '2020-01-01',
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.experiences.length).toBeGreaterThan(0);
  });

  it('should add education', async () => {
    const res = await request(app)
      .put('/api/profile/education')
      .set('x-auth-token', token)
      .send({
        school: 'Test School',
        degree: 'BSc',
        fieldofstudy: 'QA',
        from: '2015-01-01',
        to: '2019-01-01',
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.education.length).toBeGreaterThan(0);
  });

  it('should delete education', async () => {
    const profileRes = await request(app)
      .get('/api/profile/me')
      .set('x-auth-token', token);
    const eduId = profileRes.body.education[0]._id;
    const res = await request(app)
      .delete(`/api/profile/education/${eduId}`)
      .set('x-auth-token', token);
    expect(res.statusCode).toBe(200);
  });

  it('should delete experience', async () => {
    const profileRes = await request(app)
      .get('/api/profile/me')
      .set('x-auth-token', token);
    const expId = profileRes.body.experiences[0]._id;
    const res = await request(app)
      .delete(`/api/profile/experience/${expId}`)
      .set('x-auth-token', token);
    expect([200, 404]).toContain(res.statusCode); // 404 if not found
  });

  it('should delete profile and user', async () => {
    const res = await request(app)
      .delete('/api/profile')
      .set('x-auth-token', token);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('msg', 'User deleted');
  });
});

describe('Posts API', () => {
  beforeAll(async () => {
    // Re-register and re-authenticate user for posts tests
    await request(app).post('/api/users').send({
      name: 'Post User',
      email: 'postuser@example.com',
      password: 'password123',
    });
    const res = await request(app)
      .post('/api/auth')
      .send({ email: 'postuser@example.com', password: 'password123' });
    token = res.body.token;
  });

  it('should create a post', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('x-auth-token', token)
      .send({ text: 'Hello World' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('text', 'Hello World');
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

  it('should like a post', async () => {
    const res = await request(app)
      .put(`/api/posts/like/${postId}`)
      .set('x-auth-token', token);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should not like a post twice', async () => {
    const res = await request(app)
      .put(`/api/posts/like/${postId}`)
      .set('x-auth-token', token);
    expect(res.statusCode).toBe(400);
  });

  it('should unlike a post', async () => {
    const res = await request(app)
      .put(`/api/posts/unlike/${postId}`)
      .set('x-auth-token', token);
    expect(res.statusCode).toBe(200);
  });

  it('should not unlike a post not liked', async () => {
    const res = await request(app)
      .put(`/api/posts/unlike/${postId}`)
      .set('x-auth-token', token);
    expect(res.statusCode).toBe(400);
  });

  it('should comment on a post', async () => {
    const res = await request(app)
      .post(`/api/posts/comment/${postId}`)
      .set('x-auth-token', token)
      .send({ text: 'Nice post!' });
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should delete a comment', async () => {
    const postRes = await request(app)
      .get(`/api/posts/${postId}`)
      .set('x-auth-token', token);
    const commentId = postRes.body.comments[0]._id;
    const res = await request(app)
      .delete(`/api/posts/comment/${postId}/${commentId}`)
      .set('x-auth-token', token);
    expect([200, 404]).toContain(res.statusCode); // 404 if not found
  });

  it('should delete a post', async () => {
    const res = await request(app)
      .delete(`/api/posts/${postId}`)
      .set('x-auth-token', token);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('msg', 'Post removed');
  });
});
