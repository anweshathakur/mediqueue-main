import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { env } from './src/config';

const PORT = env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`⚡️[server]: MediQueue backend server is running at http://localhost:${PORT}`);
});
