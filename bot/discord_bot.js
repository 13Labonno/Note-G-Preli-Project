const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const BACKEND_URL = 'http://localhost:5000/api/status';

client.once('ready', () => {
    console.log(`Discord Bot logged in as ${client.user.tag}!`);
    
    // Proactive Alert Polling (Bonus Feature)
    // Check every 10 seconds and post alert to a designated text channel
    setInterval(async () => {
        try {
            const response = await axios.get(BACKEND_URL);
            const { alerts } = response.data;
            
            if (alerts.length > 0) {
                // Find the first available text channel where the bot can send messages
                const channel = client.channels.cache.find(c => c.isTextBased());
                if (channel) {
                    // Send humanized proactive alert message
                    channel.send(`⚠️ **Urgent Alert for Boss!** \n${alerts[0].message}\nPerson in charge: **${alerts[0].assigned_to.name}** (${alerts[0].assigned_to.phone}). Please make sure to check all switches before leaving the office!`);
                }
            }
        } catch (error) {
            console.error('Error fetching alerts for proactive check:', error.message);
        }
    }, 10000);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const command = message.content.toLowerCase().trim();

    if (command === '!status') {
        try {
            const response = await axios.get(BACKEND_URL);
            const { devices } = response.data;

            const getRoomSummary = (roomKey) => {
                const roomDevices = devices.filter(d => d.room === roomKey);
                const fansOn = roomDevices.filter(d => d.type === 'fan' && d.status === 'on').length;
                const lightsOn = roomDevices.filter(d => d.type === 'light' && d.status === 'on').length;
                return `${fansOn} fan ON, ${lightsOn} light ON`;
            };

            // Humanized Conversational Output
            const output = `🏢 **Current Office Status, Sir:**\n` +
                           `• **Drawing Room:** ${getRoomSummary('drawing')}.\n` +
                           `• **Work Room 1:** ${getRoomSummary('work1')}.\n` +
                           `• **Work Room 2:** ${getRoomSummary('work2')}.`;
            
            message.reply(output);
        } catch (error) {
            message.reply("❌ Sorry Sir, unable to connect to the backend API server.");
        }
    }

    if (command.startsWith('!room')) {
        const args = command.split(' ');
        if (args.length < 2) {
            return message.reply("💡 Please provide a room name. Example: `!room work1` (or drawing, work2)");
        }
        const roomInput = args[1];

        try {
            const response = await axios.get(BACKEND_URL);
            const { devices } = response.data;

            const validRooms = { drawing: 'Drawing Room', work1: 'Work Room 1', work2: 'Work Room 2' };
            if (!validRooms[roomInput]) {
                return message.reply("❌ Invalid room selected. Valid names are: `drawing`, `work1`, or `work2`.");
            }

            const roomDevices = devices.filter(d => d.room === roomInput);
            let statusDetails = roomDevices.map(d => `${d.name}: ${d.status.toUpperCase()}`).join(', ');

            message.reply(`📍 **Status of ${validRooms[roomInput]}:** ${statusDetails}`);
        } catch (error) {
            message.reply("❌ Error loading data.");
        }
    }

    if (command === '!usage') {
        try {
            const response = await axios.get(BACKEND_URL);
            const { metrics } = response.data;

            // Humanized Response
            const responseText = `⚡ **Power Consumption Report:**\n` +
                                 `• Total current load in the office: **${metrics.total_power_w}W**\n` +
                                 `• Estimated total consumption today: **${metrics.estimated_daily_kwh} kWh**\n` +
                                 `• Room-wise load breakdown:\n` +
                                 `  - Drawing Room: ${metrics.room_breakdown_w.drawing}W\n` +
                                 `  - Work Room 1: ${metrics.room_breakdown_w.work1}W\n` +
                                 `  - Work Room 2: ${metrics.room_breakdown_w.work2}W\n\n` +
                                 `Boss's Eco Tip: Please turn off unnecessary lights and fans!`;

            message.reply(responseText);
        } catch (error) {
            message.reply("❌ Power consumption data could not be retrieved.");
        }
    }
});

// Setting the Bot Token directly to login
const BOT_TOKEN = 'MTUyMjU5MjUxNjUxMDMxODY0Mg.Gv626d.cPhjT6uj-TZrfQoH9u6k-V6KZNhVM4X7dmoljU';

client.login(BOT_TOKEN);