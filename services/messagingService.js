// const twilio = require('twilio');
// const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

// // exports.sendIntroductoryMessage = async (registeredholders, resolutions) => {
// //   const message = `🌟 *International Breweries AGM Voting* 🌟\n\n` +
// //     `Dear ${registeredholders.name},\n\n` +
// //     `You are invited to participate in our AGM voting for ${resolutions.length} resolutions:\n\n` +
    
// //     // resolutions.map((res, i) => 
// //     //   `*Resolution ${i+1}:* ${res.title}\n` +
// //     //   `${res.description}\n`
// //     // ).join('\n') +
    
// //     `\n*Voting Process:*\n` +
// //     `1. You will receive each resolution separately\n` +
// //     `2. Reply with YES or NO when prompted\n` +
// //     `3. Wait for confirmation before next resolution\n\n` +
// //     `*Voting opens soon!*\n\n` +
// //     `_International Breweries Plc`;

// // //   await client.messages.create({
// // //     body: message,
// // //     from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
// // //     to: `whatsapp:${registeredholders.phoneNumber}`
// // //   });
// // // };
// // // For initial message
// // await client.messages.create({
// //   body: {
// //     type: 'template',
// //     template: {
// //       name: 'introductory_message',
// //       language: { code: 'en' },
// //       components: [{
// //         type: 'body',
// //         parameters: [
// //           { type: 'text', text: registeredholders.name },
// //           { type: 'text', text: resolutions.length.toString() }
// //         ]
// //       }]
// //     }
// //   },
// //   from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
// //   to: `whatsapp:${registeredholders.phoneNumber}`
// // });
// // }


// exports.sendIntroductoryMessage = async (registeredholders, resolutions) => {
//   try {
//     await client.messages.create({
//       from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
//       to: `whatsapp:${registeredholders.phoneNumber}`,
//       contentSid: process.env.TWILO_TEMPLATE_CONTENT_SID, // Get this from Twilio console
//       contentVariables: JSON.stringify({
//         '1': registeredholders.name,
//         '2': resolutions.length.toString()
//       })
//     });
//   } catch (templateError) {
//     console.log('Template failed, falling back to text message');
    
//     // Fallback to regular message (only works within 24h window)
//     return await client.messages.create({
//       body: `Dear ${registeredholders.name}, please reply START to begin voting.`,
//       from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
//       to: `whatsapp:${registeredholders.phoneNumber}`
//     });
//   }
// };



// exports.sendResolutionVoteMessage = async (registeredholders, resolution) => {
//   const message = `📢 *Resolution for Voting*\n\n` +
//     `*${resolution.title}*\n` +
//     `${resolution.description}\n\n` +
//     `*How to vote:*\n` +
//     `Reply with:\n` +
//     `✅ "YES" - To approve\n` +
//     `❌ "NO" - To reject\n\n` +
//     `Voting ends: ${resolution.votingEnd.toLocaleString()}\n\n` +
//     `_International Breweries AGM_`;

//   await client.messages.create({
//     body: message,
//     from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
//     to: `whatsapp:${registeredholders.phoneNumber}`
//   });
// };

// exports.sendVoteConfirmation = async (registeredholders, resolution, vote) => {
//   const message = `✅ *Vote Recorded!*\n\n` +
//     `Thank you ${registeredholders.name}!\n\n` +
//     `*Resolution:* ${resolution.title}\n` +
//     `*Your vote:* ${vote === 'YES' ? '✅ YES' : '❌ NO'}\n` +
//     `*Voting power:* ${registeredholders.shareholding.toLocaleString()} units\n` +
//     `*Time:* ${new Date().toLocaleString()}\n\n` +
//     `You'll be notified when the next resolution is ready.`;

//   await client.messages.create({
//     body: message,
//     from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
//     to: `whatsapp:${registeredholders.phoneNumber}`
//   });
// };


const twilio = require('twilio');
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

// Template message sender with fallback
const sendTemplateWithFallback = async (to, templateSid, variables, fallbackText) => {
  try {
    return await client.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${to}`,
      contentSid: templateSid,
      contentVariables: JSON.stringify(variables)
    });
  } catch (templateError) {
    console.error('Template failed, falling back:', templateError.message);
    return await client.messages.create({
      body: fallbackText,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${to}`
    });
  }
};

exports.sendIntroductoryMessage = async (registeredholders, resolutions) => {
  return sendTemplateWithFallback(
    registeredholders.phoneNumber,
    process.env.WHATSAPP_INTRO_TEMPLATE_SID,
    {
      '1': registeredholders.name,
      '2': resolutions.length.toString()
    },
    `🌟 *International Breweries AGM Voting* 🌟\n\n` +
    `Dear ${registeredholders.name},\n\n` +
    `You are invited to participate in our AGM voting for ${resolutions.length} resolutions.\n\n` +
    `Reply START to begin voting.`
  );
};

exports.sendResolutionVoteMessage = async (registeredholders, resolution) => {
  try {
    return await client.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${registeredholders.phoneNumber}`,
      contentSid: process.env.WHATSAPP_RESOLUTION_TEMPLATE_SID,
      contentVariables: JSON.stringify({
        '1': resolution.title,
        '2': resolution.description,
        '3': resolution.votingEnd.toLocaleString()
      }),
      // ADD THIS FOR INTERACTIVE BUTTONS:
      actions: {
        buttons: [
          {
            type: "reply",
            reply: {
              id: "vote_yes",
              title: "✅ YES"
            }
          },
          {
            type: "reply",
            reply: {
              id: "vote_no",
              title: "❌ NO"
            }
          }
        ]
      }
    });
  } catch (error) {
    console.error('Failed to send interactive message:', error);
    // Fallback to text version
    return await client.messages.create({
      body: `📢 *Resolution for Voting*\n\n*${resolution.title}*\n${resolution.description}\n\n` +
            `Type in:\n✅ YES - To approve\n❌ NO - To reject\n\n` +
            `Voting ends: ${resolution.votingEnd.toLocaleString()}`,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${registeredholders.phoneNumber}`
    });
  }
};

exports.sendVoteConfirmation = async (registeredholders, resolution, vote) => {
  return sendTemplateWithFallback(
    registeredholders.phoneNumber,
    process.env.WHATSAPP_CONFIRMATION_TEMPLATE_SID,
    {
      '1': registeredholders.name,
      '2': resolution.title,
      '3': vote === 'YES' ? '✅ YES' : '❌ NO',
      '4': registeredholders.shareholding.toLocaleString(),
      '5': new Date().toLocaleString()
    },
    `✅ *Vote Recorded!*\n\n` +
    `Thank you ${registeredholders.name}!\n\n` +
    `*Resolution:* ${resolution.title}\n` +
    `*Your vote:* ${vote === 'YES' ? '✅ YES' : '❌ NO'}\n` +
    `*Units:* ${registeredholders.shareholding.toLocaleString()} units\n` +
    `*Time:* ${new Date().toLocaleString()}`
  );
};