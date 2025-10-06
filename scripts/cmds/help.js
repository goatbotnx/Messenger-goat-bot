const fs = require('fs');
const path = require('path');

module.exports = {
	config: {
		name: "help",
		version: "2.4.60",
		role: 0,
		countDown: 0,
		author: "ST | Sheikh Tamim",
		description: "Displays all available commands and their categories.",
		category: "help"
	},

	ST: async ({ api, event, args }) => {
		const cmdsFolderPath = path.join(__dirname, '.');
		const files = fs.readdirSync(cmdsFolderPath).filter(file => file.endsWith('.js'));

		const sendMessage = async (message, threadID, messageID = null) => {
			try {
				return await api.sendMessage(message, threadID, messageID);
			} catch (error) {
				console.error('Error sending message:', error);
			}
		};

		const getCategories = () => {
			const categories = {};
			for (const file of files) {
				try {
					const command = require(path.join(cmdsFolderPath, file));
					const { category } = command.config;
					const categoryName = category || 'uncategorized';
					if (!categories[categoryName]) categories[categoryName] = [];
					categories[categoryName].push(command.config);
				} catch (error) {
					// Skip invalid command files
				}
			}
			return categories;
		};

		try {
			// If specific command requested directly
			if (args[0] && !args[0].match(/^\d+$/)) {
				const commandName = args[0].toLowerCase();
				const command = files.map(file => {
					try {
						return require(path.join(cmdsFolderPath, file));
					} catch {
						return null;
					}
				}).filter(cmd => cmd !== null)
				.find(cmd => cmd.config.name.toLowerCase() === commandName || (cmd.config.aliases && cmd.config.aliases.includes(commandName)));

				if (command) {
					// Display command details
					let commandDetails = `╭─────────────────────◊\n`;
					commandDetails += `│  🔹 COMMAND DETAILS\n`;
					commandDetails += `├─────────────────────◊\n`;
					commandDetails += `│ ⚡ Name: ${command.config.name}\n`;
					commandDetails += `│ 📝 Version: ${command.config.version || 'N/A'}\n`;
					commandDetails += `│ 👤 Author: ${command.config.author || 'Unknown'}\n`;
					commandDetails += `│ 🔐 Role: ${command.config.role !== undefined ? command.config.role : 'N/A'}\n`;
					commandDetails += `│ 📂 Category: ${command.config.category || 'uncategorized'}\n`;
					commandDetails += `│ 💎 Premium: ${command.config.premium == true ? '✅ Required' : '❌ Not Required'}\n`;
					commandDetails += `│ 🔧 Use Prefix: ${command.config.usePrefix !== undefined ? (command.config.usePrefix ? '✅ Required' : '❌ Not Required') : '⚙️ Global Setting'}\n`;

					if (command.config.aliases && command.config.aliases.length > 0) {
						commandDetails += `│ 🔄 Aliases: ${command.config.aliases.join(', ')}\n`;
					}

					if (command.config.countDown !== undefined) {
						commandDetails += `│ ⏱️ Cooldown: ${command.config.countDown}s\n`;
					}

					commandDetails += `├─────────────────────◊\n`;

					// Description
					if (command.config.description) {
						const desc = typeof command.config.description === 'string' ? command.config.description : command.config.description.en || 'No description available';
						commandDetails += `│ 📋 Description:\n│ ${desc}\n├─────────────────────◊\n`;
					}

					// Guide/Usage
					const guideText = command.config.guide ? (typeof command.config.guide === 'string' ? command.config.guide : command.config.guide.en || 'No guide available') : 'No guide available';
					commandDetails += `│ 📚 Usage Guide:\n│ ${guideText.replace(/{pn}/g, `!${command.config.name}`)}\n`;

					commandDetails += `╰─────────────────────◊\n`;
					commandDetails += `     💫 ST_BOT Command Info`;

					await sendMessage(commandDetails, event.threadID);
				} else {
					await sendMessage(`❌ Command not found: ${commandName}`, event.threadID);
				}
			} else {
				// Stage 1: Show categories with serial numbers
				const categories = getCategories();
				const categoryNames = Object.keys(categories).sort();
				
				let helpMessage = '╭─────────────────────◊\n';
				helpMessage += '│     📋 COMMAND CATEGORIES\n';
				helpMessage += '├─────────────────────◊\n';
				
				categoryNames.forEach((category, index) => {
					const commandCount = categories[category].length;
					helpMessage += `│ ${index + 1}. ${category.charAt(0).toUpperCase() + category.slice(1)}\n`;
					helpMessage += `│    └─ ${commandCount} commands\n`;
				});
				
				helpMessage += '├─────────────────────◊\n';
				helpMessage += '│ 💡 Reply with category number\n';
				helpMessage += '│    to see commands\n';
				helpMessage += '│ 💡 Type !help <cmdname>\n';
				helpMessage += '│    for direct command info\n';
				helpMessage += '╰─────────────────────◊\n';
				helpMessage += '        💫 Help Menu';

				const sentMessage = await sendMessage(helpMessage, event.threadID);
				
				// Set up onReply for category selection (Stage 1)
				if (sentMessage) {
					global.GoatBot.onReply.set(sentMessage.messageID, {
						commandName: "help",
						messageID: sentMessage.messageID,
					
