const { registerUser, loginUser } = require('./utils/authUtils');
const users = require('./data/users');

afterAll(async () => {
  // Clean up users collection after tests
  const mongoose = require('mongoose');
  await mongoose.connection.dropCollection('users').catch(() => {});
  await mongoose.connection.close();
});

describe('User Registration', () => {
  it('should register a new user', async () => {
    const res = await registerUser(users.validUser);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should not register with existing email', async () => {
    await registerUser(users.validUser); // Register once
    const res = await registerUser(users.validUser); // Try again
    expect(res.statusCode).toBe(400);
  });

  it('should not register with invalid data', async () => {
    const res = await registerUser(users.invalidUser);
    expect(res.statusCode).toBe(400);
  });
});

describe('User Authentication', () => {
  it('should authenticate user and return token', async () => {
    await registerUser(users.validUser);
    const res = await loginUser({
      email: users.validUser.email,
      password: users.validUser.password,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should not authenticate with wrong password', async () => {
    await registerUser(users.validUser);
    const res = await loginUser({
      email: users.validUser.email,
      password: 'wrongpass',
    });
    expect(res.statusCode).toBe(400);
  });

  it('should not authenticate with non-existent user', async () => {
    const res = await loginUser({
      email: 'nouser@example.com',
      password: 'password123',
    });
    expect(res.statusCode).toBe(400);
  });
});
