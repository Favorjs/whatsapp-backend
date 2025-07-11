require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const sequelize = require('./config/database');
const { secureHeaders, apiLimiter } = require('./middleware/security');
const adminRoutes = require('./routes/adminRoutes');
const resolutionRoutes = require('./routes/resolutionRoutes');
const voteRoutes = require('./routes/voteRoutes');
const whatsappRoutes = require('./routes/whatsappRoutes');
// const RegisteredHolders =require('../backend/models/RegisteredHolders')

const twilio = require('twilio');
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? 'https://your-production-domain.com' 
      : 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use(secureHeaders);

// Database connection
sequelize.authenticate()
  .then(() => console.log('Database connected'))
  .catch(err => console.error('Database connection error:', err));

// Apply rate limiting to API routes
app.use('/api', apiLimiter);

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/resolutions', resolutionRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/whatsapp', whatsappRoutes);

// WebSocket for real-time updates
io.on('connection', (socket) => {
  console.log('Client connected');
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Broadcast vote updates
const broadcastVoteUpdate = async () => {
  const votes = await sequelize.query(`
    SELECT r.title, v.vote, SUM(v.voting_power) as total_power, COUNT(v.id) as vote_count
    FROM votes v
    JOIN resolutions r ON v.resolution_id = r.id
    GROUP BY r.title, v.vote
  `, { type: sequelize.QueryTypes.SELECT });
  
  io.emit('vote_update', votes);
};


// Add this to your initialization code (e.g., in messagingService.js)

// const configureWhatsAppProfile = async () => {
//   try {
//     // First verify the WhatsApp number is properly set up
//     const whatsappNumber = await client.incomingPhoneNumbers
//       .list({phoneNumber: process.env.TWILIO_WHATSAPP_NUMBER});
    
//     if (!whatsappNumber.length) {
//       console.error('WhatsApp number not found in your Twilio account');
//       return;
//     }

//     // Update WhatsApp business profile using the correct API
//     await client.messages.create({
//       from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
//       to: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`, // Send to yourself
//       body: 'UPDATE_PROFILE',
//       persistentAction: JSON.stringify([
//         {
//           "displayName": "Apel Capital Registrars",
       
//         }
//       ])
//     });

//     console.log('WhatsApp Business Profile update requested');
//   } catch (error) {
//     console.error('Error updating WhatsApp profile:', error.message);
//     if (error.code === 20404) {
//       console.error('Verify your WhatsApp number is properly configured in Twilio');
//     }
//   }
// };

// configureWhatsAppProfile();
// Example: Inserting a new holder

// Make broadcast function available globally
global.broadcastVoteUpdate = broadcastVoteUpdate;

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});