const twilio = require('twilio');
const { Shareholder, Resolution, Vote,RegisteredHolders} = require('../models');
const { whatsappLimiter } = require('../middleware/security');
const { sendResolutionVoteMessage, sendVoteConfirmation,sendIntroductoryMessage } = require('../services/messagingService');
const { Op } = require('sequelize');
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

exports.processVote = async (req, res) => {
  const { From: phone, Body: message, ButtonText: buttonText} = req.body;
  
  try {
    // Rate limiting
    await whatsappLimiter.consume(phone, 1);

    // Find shareholder by phone
    const shareholder = await RegisteredHolders.findOne({ 
      where: { phoneNumber: phone } 
    });
    
    if (!shareholder) {
      return sendWhatsAppResponse(phone, "❌ You are not a registered shareholder");
    }

    // Get active resolution
    const resolution = await Resolution.findOne({
      where: {
        status: 'active',
        votingStart: { [Op.lte]: new Date() },
        votingEnd: { [Op.gte]: new Date() }
      }
    });

    if (!resolution) {
      return sendWhatsAppResponse(phone, "❌ No active voting at this time");
    }

    // Validate vote
   // Handle both text and button responses
   const voteValue = buttonText 
   ? buttonText.includes('YES') ? 'YES' : 'NO'
   : message.trim().toUpperCase();

 if (!['YES', 'NO'].includes(voteValue)) {
   return res.status(200).send(`
     <Response>
       <Message>Invalid vote. Please use the buttons provided.</Message>
     </Response>
   `);
 }

    // Check for duplicate vote
    const existingVote = await Vote.findOne({
      where: {
        shareholderId: shareholder.id,
        resolutionId: resolution.id
      }
    });

    if (existingVote) {
      return sendWhatsAppResponse(phone, "❌ You have already voted on this resolution");
    }

    // Record vote
    await Vote.create({
      vote: voteValue,
      votingPower:shareholder.shareholding,
      voteType: 'WHATSAPP',
      shareholderId: shareholder.id,
      resolutionId: resolution.id
    });

    // Send confirmation
    await sendVoteConfirmation(shareholder, resolution, voteValue);

    // Broadcast update to dashboard
    global.broadcastVoteUpdate(resolution.id);
    

    res.status(200).send('<Response></Response>');

  }catch (error) {
    console.error('Error processing vote:', error);
    res.status(200).send(`
      <Response>
        <Message>❌ System error. Please try again later.</Message>
      </Response>
    `);
  }
};

exports.sendIntroMessages = async (req, res) => {
  try {
    const registeredholders = await RegisteredHolders.findAll({ 
      where: { status: 'active' } 
    });
    const resolutions = await Resolution.findAll();

    for (const registeredholder of registeredholders) {
      await sendIntroductoryMessage(registeredholder, resolutions);
    }

    res.send({ 
      success: true,
      message: `Introductory messages sent to ${registeredholders.length} registeredholders`
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

exports.startResolutionVoting = async (req, res) => {
  try {
    const resolution = await Resolution.findByPk(req.params.resolutionId);
    
    if (!resolution) {
      return res.status(404).send({ error: 'Resolution not found' });
    }

    // Update resolution status
    await resolution.update({
      status: 'active',
      votingStart: new Date(),
      votingEnd: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });

    // Notify registeredholders
    const registeredholders = await RegisteredHolders.findAll({ 
      where: { status: 'active' } 
    });

    for (const registeredholder of registeredholders) {
      await sendResolutionVoteMessage(registeredholder, resolution);
    }

    res.send({ 
      success: true,
      message: `Voting started for resolution: ${resolution.title}`,
      registeredholdersNotified: registeredholders.length
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

async function sendWhatsAppResponse(phone, message) {
  await client.messages.create({
    body: message,
    from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
    to: `whatsapp:${phone}`
  });
}

