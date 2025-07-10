import express from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { createServer } from 'http';
import { Server } from 'socket.io';

const prisma = new PrismaClient();
const app = express();
app.use(express.json());

function auth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).send('Missing token');
  try {
    const [, token] = header.split(' ');
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { id: number };
    (req as any).userId = payload.id;
    next();
  } catch (e) {
    return res.status(401).send('Invalid token');
  }
}

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.password !== password) return res.status(401).send('Invalid');
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret');
  res.json({ token });
});

app.post('/users', async (req, res) => {
  const { email, password, role } = req.body;
  try {
    const user = await prisma.user.create({ data: { email, password, role } });
    res.json(user);
  } catch (e) {
    res.status(400).send('User creation failed');
  }
});

app.get('/users', async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

app.post('/rides', auth, async (req, res) => {
  const { originLat, originLng, destLat, destLng } = req.body;
  try {
    const ride = await prisma.ride.create({
      data: {
        passengerId: (req as any).userId,
        status: 'requested',
        originLat,
        originLng,
        destLat,
        destLng
      }
    });
    io.emit('ride:created', ride);
    res.json(ride);
  } catch (e) {
    res.status(400).send('Ride creation failed');
  }
});

app.patch('/rides/:id/accept', auth, async (req, res) => {
  const rideId = parseInt(req.params.id, 10);
  try {
    const ride = await prisma.ride.update({
      where: { id: rideId },
      data: { status: 'accepted', driverId: (req as any).userId }
    });
    io.emit('ride:updated', ride);
    res.json(ride);
  } catch (e) {
    res.status(400).send('Ride update failed');
  }
});

app.get('/rides', async (req, res) => {
  const rides = await prisma.ride.findMany();
  res.json(rides);
});

const httpServer = createServer(app);
export const io = new Server(httpServer, { cors: { origin: '*' } });

export default app;

if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  httpServer.listen(PORT, () => console.log(`Backend on ${PORT}`));
}
