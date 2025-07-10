import request from 'supertest';
import app from '../src/index';

test('unauthorized', async () => {
  const res = await request(app).get('/rides');
  expect(res.status).toBe(200);
});
