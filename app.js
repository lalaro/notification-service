const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();
 
const app = express();
 
// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
 
// Conexión a MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/notification_service_db';
 
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB conectado exitosamente'))
  .catch(err => console.error('❌ Error conectando a MongoDB:', err));
 
// Rutas básicas
app.get('/', (req, res) => {
  res.json({ 
    message: 'Notification Service API',
    service: 'notification-service',
    status: 'running',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      notifications: '/api/notifications',
      send: '/api/notifications/send'
    }
  });
});
 
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'notification-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});
 
// Importar rutas (descomentar cuando las tengas)
// const notificationRoutes = require('./src/routes/notificationRoutes');
// app.use('/api/notifications', notificationRoutes);
 
// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    path: req.path,
    service: 'notification-service'
  });
});
 
// Manejo de errores generales
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Ocurrió un error',
    service: 'notification-service'
  });
});
 
// Puerto
const PORT = process.env.PORT || 3004;
 
const server = app.listen(PORT, () => {
  console.log(`🚀 Notification Service ejecutándose en puerto ${PORT}`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});
 
// Manejo de cierre graceful
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM recibido, cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado');
    mongoose.connection.close(false, () => {
      console.log('✅ MongoDB desconectado');
      process.exit(0);
    });
  });
});
 
module.exports = app;
