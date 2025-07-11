require('dotenv').config();
const twilio = require('twilio');

// Initialize Twilio client with error handling
let client;
try {
  client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
} catch (err) {
  console.error('Twilio initialization failed:', err.message);
  process.exit(1);
}

// Message validation function
const validateAndFormatNumber = (phone) => {
  // Nigerian number validation (+234 or 0 prefix)
  const regex = /^(\+234|0)[7-9][0-1]\d{8}$/;
  
  if (!regex.test(phone)) {
    throw new Error(`Invalid Nigerian phone number: ${phone}`);
  }
  
  // Convert to E.164 format
  return phone.startsWith('0') ? `+234${phone.substring(1)}` : phone;
};

// Usage in your send function
exports.sendMessage = async (to, body) => {
  try {
    const formattedTo = validateAndFormatNumber(to);
    
    await client.messages.create({
      body: body,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${formattedTo}`
    });
  } 

  
   catch (error) {
    console.error(`Attempt ${attempt} failed for ${to}:`, error.message);
    
    if (attempt < 3) {
      // Exponential backoff retry
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      return sendWhatsAppMessage(to, body, attempt + 1);
    }
    
    throw new Error(`Failed to send message after ${attempt} attempts: ${error.message}`);
  }
};

// Message template formatter
const formatMessage = (template, data) => {
  return template.replace(/\${(\w+)}/g, (_, key) => data[key] || '');
};

module.exports = {
  client,
  sendWhatsAppMessage,
  validatePhoneNumber,
  formatMessage
};