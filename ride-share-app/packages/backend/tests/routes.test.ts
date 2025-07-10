import request from 'supertest';
import app from '../src/index';

describe('backend routes', () => {
  it('creates user, logs in and creates ride', async () => {
    const create = await request(app).post('/users').send({ email: 'a@test.com', password: 'p', role: 'passenger' });
    expect(create.status).toBe(200);

    const login = await request(app).post('/login').send({ email: 'a@test.com', password: 'p' });
    expect(login.status).toBe(200);
    const token = login.body.token;

    const ride = await request(app)
      .post('/rides')
      .set('Authorization', `Bearer ${token}`)
      .send({ originLat: 0, originLng: 0, destLat: 1, destLng: 1 });
    expect(ride.status).toBe(200);
    expect(ride.body.status).toBe('requested');
  });
});
