import swaggerJsdoc from 'swagger-jsdoc';

const servers = [];

if (process.env.RENDER_EXTERNAL_URL) {
  servers.push({
    url: `${process.env.RENDER_EXTERNAL_URL}/api`,
    description: 'Production Server (Render)'
  });
}

servers.push({
  url: `http://localhost:${process.env.PORT || 3000}/api`,
  description: 'Local Development Server'
});

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TemuLapak API',
      version: '1.0.0',
      description: 'Dokumentasi REST API TemuLapak (MSME, Event Organizer & Admin)'
    },
    servers,
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Masukkan access_token dari Supabase Auth'
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
};

export const swaggerSpec = swaggerJsdoc(options);