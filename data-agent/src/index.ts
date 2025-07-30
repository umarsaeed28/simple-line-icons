import express from 'express';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/health', (_, res) => res.json({ status: 'ok' }));

app.post('/run', async (req, res) => {
  res.json({ message: 'Data Agent stub' });
});

app.listen(port, () => {
  console.log('Data Agent listening on', port);
});