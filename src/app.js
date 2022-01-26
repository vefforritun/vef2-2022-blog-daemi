import dotenv from 'dotenv';
import express from 'express';
import { readdir } from 'fs/promises';

dotenv.config();

const app = express();

const { HOST: hostname = '127.0.0.1', PORT: port = 3000 } = process.env;

const BLOG_DIR = './blog';

app.get('/', async (req, res) => {
  const files = await readdir(BLOG_DIR);

  console.info('request to /');
  res.send(
    `Hello World! The time is now ${new Date().toISOString()}. Files available are: ${files.join(
      ', '
    )}`
  );
});

app.listen(port, () => {
  console.info(`Server running at http://${hostname}:${port}/`);
});
