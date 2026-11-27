import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';
import routes from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { createHttpError } from './utils/httpError.js';
import { sendSuccess } from './utils/responseHelper.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  return sendSuccess(res, {
    message: 'TemuLapak API is running'
  });
});

app.use('/api', routes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use((req, res, next) => {
  next(createHttpError(404, 'Endpoint tidak ditemukan'));
});

app.use(errorHandler);

export default app;