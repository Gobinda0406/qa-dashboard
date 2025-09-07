const request = require('supertest');
const app = require('../../server');

async function createProfile(token, profileData) {
  return await request(app)
    .post('/api/profile')
    .set('x-auth-token', token)
    .send(profileData);
}

module.exports = { createProfile };
