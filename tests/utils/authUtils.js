const request = require('supertest');
const app = require('../../server');

async function registerUser(userData) {
  return await request(app).post('/api/users').send(userData);
}

async function loginUser(credentials) {
  return await request(app).post('/api/auth').send(credentials);
}

module.exports = { registerUser, loginUser };
