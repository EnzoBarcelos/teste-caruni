import express from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
app.use(express.json());

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.password !== password) return res.status(401).send('Invalid');
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret');
  res.json({ token });
});

app.get('/rides', async (req, res) => {
  const rides = await prisma.ride.findMany();
  res.json(rides);
});

export default app;

if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => console.log(`Backend on ${PORT}`));
}
