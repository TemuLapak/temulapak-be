import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'TemuLapak API is running'
  });
});

app.use('/api', routes);

// Tangani endpoint yang tidak terdaftar
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint tidak ditemukan'
  });
});

// Middleware error handler wajib diletakkan paling akhir
app.use(errorHandler);

export default app;