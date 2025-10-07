const { findUid } = global.utils;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
	config: {
		name: "join",
		version: "1.4",
		author: "Chitron Bhattacharjee",
		countDown: 10,
		role: 1,
		shortDescription: {
			en: "Add runner + author to all groups"
		},
		longDescription: {
			en: "Adds the command runner and bot author to every group where the bot is a member, if they aren't already added."
		},
		category: "owner",
		guide: {
			en: "+joinadmin"
		}
	},

	onStart: async function ({ api, message, threadsData, event }) {
		const authorUID = "100066867630344"; // ✅ fixed missing quote
		const runnerUID = event.senderID;
		const allToAdd = Array.from(new Set([authorUID, runnerUID]));
		const allThreads = await threadsData.getAll();

		let added = 0, skipped = 0, failed = 0;

		for (const thread of allThreads) {
			const { threadID, isGroup } = thread;
			if (!isGroup) continue;

			try {
				const info = await api.getThreadInfo(threadID);
				const participantIDs = info.participantIDs || [];
				const adminIDs = info.adminIDs?.map(a => a.id) || [];
				const approvalMode = info.approvalMode || false;
				const botID = api.getCurrentUserID();

				for (const uid of allToAdd) {
					if (participantIDs.includes(uid)) {
						skipped++;
						continue;
					}

					try {
						await api.addUserToGroup(uid, threadID);
						await sleep(500);

						if (approvalMode && !adminIDs.includes(botID)) {
							console.log(`🟡 Approval needed for UID ${uid} in thread ${threadID}`);
						}
						added++;
					} catch (err) {
						console.log(`❌ Failed to add UID ${uid} in ${threadID}: ${err.message}`);
						failed++;
					}
				}
			} catch (err) {
				console.log(`❌ Error in thread ${thread.threadID}: ${err.message}`);
				failed++;
			}
		}

		const box = `┌───────────────┐\n` +
			`│ 📦 𝗔𝗱𝗱 𝗔𝗱𝗺𝗶𝗻 𝗦𝘂𝗺𝗺𝗮𝗿𝘆\n` +
			`├───────────────┤\n` +
			`│ 🟢 Added   : ${added}\n` +
			`│ 🟡 Skipped : ${skipped}\n` +
			`│ 🔴 Failed  : ${failed}\n` +
			`└───────────────┘\n` +
			`👑 Synced author + runner (${runnerUID}).`;

		return message.reply(box);
	}
};
