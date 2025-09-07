const { registerUser, loginUser } = require('./utils/authUtils');
const { createProfile } = require('./utils/profileUtils');
const profiles = require('./data/profiles');
const users = require('./data/users');
const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');

let token = '';
let userId = '';

describe('Profile API', () => {
  beforeAll(async () => {
    await registerUser(users.validUser);
    const res = await loginUser({
      email: users.validUser.email,
      password: users.validUser.password,
    });
    token = res.body.token;
  });

  afterAll(async () => {
    // Clean up users and profiles collections after tests
    await mongoose.connection.dropCollection('users').catch(() => {});
    await mongoose.connection.dropCollection('profiles').catch(() => {});
    await mongoose.connection.close();
  });

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
    const res = await createProfile(token, profiles.validProfile);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', profiles.validProfile.status);
    userId = res.body.user;
  });

  it('should get current profile with token', async () => {
    const res = await request(app)
      .get('/api/profile/me')
      .set('x-auth-token', token);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', profiles.validProfile.status);
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

  // Add more profile CRUD tests as needed...
});
