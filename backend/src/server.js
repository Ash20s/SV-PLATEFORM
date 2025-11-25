require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const connectDB = require('./config/database');
const errorHandler = require('./utils/errorHandler');
const rateLimiter = require('./middlewares/rateLimiter');
const { startKeepAlive } = require('./utils/keepAlive');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: process.env.CLIENT_URL, methods: ['GET', 'POST'] } });

// Connexion MongoDB avec keep-alive
connectDB().then(() => {
  startKeepAlive();
}).catch((err) => {
  console.error('❌ Erreur de connexion MongoDB:', err);
  process.exit(1);
});

app.use(helmet());
app.use(cors({ 
  origin: process.env.CLIENT_URL || 'http://localhost:5173', 
  credentials: true 
}));
app.use(morgan('dev'));
app.use(express.json());
// Rate limiter temporairement désactivé pour développement
// app.use(rateLimiter);

// Servir les fichiers statiques uploadés avec CORS
app.use('/uploads', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.CLIENT_URL || 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
}, express.static(path.join(__dirname, '../uploads')));

// Disable caching for API routes
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// API routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/teams', require('./routes/teams.routes'));
app.use('/api/scrims', require('./routes/scrims.routes'));
app.use('/api/tournaments', require('./routes/tournaments.routes'));
app.use('/api/stats', require('./routes/stats.routes'));
app.use('/api/announcements', require('./routes/announcements.routes'));
app.use('/api/listings', require('./routes/listing.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/profile', require('./routes/profile.routes'));
app.use('/api/posts', require('./routes/post.routes'));
app.use('/api/matches', require('./routes/matches.routes'));
app.use('/api/mock', require('./routes/mock.routes'));
app.use('/api/guest-invites', require('./routes/guestInvites.routes'));
app.use('/api/twitch', require('./routes/twitch.routes'));
app.use('/api/mock-twitch', require('./routes/mock-twitch.routes'));
app.use('/api/leaderboard', require('./routes/leaderboard.routes'));
app.use('/api/admin', require('./routes/admin.routes'));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Socket.io setup
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  // Add socket event handlers here
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

module.exports = { app, server, io };
