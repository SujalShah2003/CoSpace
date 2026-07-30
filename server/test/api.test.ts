import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app } from '../src/app.js';

test('health endpoint uses the standard success response', async () => {
  const response = await request(app).get('/api/health').expect(200);
  assert.equal(response.body.success, true);
  assert.equal(response.body.data.status, 'healthy');
});

const integrationOptions = {
  skip: process.env.RUN_INTEGRATION_TESTS !== 'true'
    ? 'Set RUN_INTEGRATION_TESTS=true to test against the configured Supabase project.'
    : false,
};

test('register defaults to member and member can request a booking', integrationOptions, async () => {
  const email = `member-${Date.now()}@example.com`;
  const registration = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Test Member', email, password: 'secret123' })
    .expect(201);

  assert.equal(registration.body.data.user.role, 'member');
  assert.equal(registration.body.success, true);
  assert.equal(registration.body.statusCode, 201);
  assert.equal(typeof registration.body.timestamp, 'string');
  assert.equal(registration.body.data.tokens.tokenType, 'Bearer');
  assert.equal(registration.body.data.tokens.accessTokenExpiresIn, 900);
  assert.equal(registration.body.data.tokens.refreshTokenExpiresIn, 604800);
  const token = registration.body.data.tokens.accessToken;

  const spaces = await request(app).get('/api/public/spaces').expect(200);
  const spaceId = spaces.body.data[0].id;
  const pagedSpaces = await request(app)
    .get('/api/public/spaces?page=1&pageSize=2')
    .expect(200);
  assert.equal(pagedSpaces.body.data.length, 2);
  assert.equal(pagedSpaces.body.pagination.pageSize, 2);
  assert.equal(pagedSpaces.body.pagination.hasNextPage, true);

  const filteredSpaces = await request(app)
    .get('/api/public/spaces?search=olive&minCapacity=5')
    .expect(200);
  assert.equal(filteredSpaces.body.data.length, 1);
  assert.equal(filteredSpaces.body.data[0].name, 'The Olive Room');
  assert.equal(filteredSpaces.body.pagination.total, 1);

  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  const booking = await request(app)
    .post('/api/member/booking-requests')
    .set('Authorization', `Bearer ${token}`)
    .send({ spaceId, date: tomorrow, startTime: '08:00', endTime: '10:00' })
    .expect(201);

  assert.equal(booking.body.data.status, 'pending');
});

test('admin can authenticate and manage spaces', integrationOptions, async () => {
  const login = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@cospace.com', password: 'Admin@123' })
    .expect(200);

  assert.equal(login.body.data.user.role, 'admin');
  const { accessToken, refreshToken } = login.body.data.tokens;

  const refreshed = await request(app)
    .post('/api/auth/refresh')
    .send({ refreshToken })
    .expect(200);

  assert.notEqual(refreshed.body.data.tokens.accessToken, accessToken);
  assert.notEqual(refreshed.body.data.tokens.refreshToken, refreshToken);

  const revokedRefresh = await request(app)
    .post('/api/auth/refresh')
    .send({ refreshToken })
    .expect(401);
  assert.deepEqual(
    Object.keys(revokedRefresh.body).sort(),
    ['errors', 'message', 'statusCode', 'success', 'timestamp'].sort(),
  );

  await request(app)
    .get('/api/admin/spaces')
    .set('Authorization', `Bearer ${refreshed.body.data.tokens.accessToken}`)
    .expect(200);

  const rotatedRefreshToken = refreshed.body.data.tokens.refreshToken;
  await request(app)
    .post('/api/auth/logout')
    .send({ refreshToken: rotatedRefreshToken })
    .expect(200);

  const refreshAfterLogout = await request(app)
    .post('/api/auth/refresh')
    .send({ refreshToken: rotatedRefreshToken })
    .expect(401);
  assert.equal(refreshAfterLogout.body.success, false);
  assert.equal(refreshAfterLogout.body.statusCode, 401);
});
