const os = require("os");

module.exports = {
  config: {
    name: "uptime",
    version: "2.3",
    author: "xnil6x (fixed by Nx)",
    role: 0,
    shortDescription: "Show bot uptime info",
    longDescription: "Displays stylish uptime, system stats, RAM usage, prefix, threads, and commands info.",
    category: "system",
    guide: "{pn}"
  },

  onStart: async function ({ message, threadsData }) {
    try {
      const uptime = process.uptime();
      const days = Math.floor(uptime / (60 * 60 * 24));
      const hours = Math.floor((uptime % (60 * 60 * 24)) / (60 * 60));
      const minutes = Math.floor((uptime % (60 * 60)) / 60);
      const seconds = Math.floor(uptime % 60);

      const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;

      const cpu = os.cpus()[0].model;
      const cores = os.cpus().length;
      const platform = os.platform();
      const arch = os.arch();
      const nodeVersion = process.version;
      const hostname = os.hostname();

      const totalMem = os.totalmem() / 1024 / 1024;
      const freeMem = os.freemem() / 1024 / 1024;
      const usedMem = totalMem - freeMem;

      const prefix = global.GoatBot.config.prefix || "/";
      const totalThreads = await threadsData.getAll().then(t => t.length).catch(() => 0);
      const totalCommands = global.GoatBot.commands.size;

      const line = "═".repeat(45);
      const box = `
╔😈${line}😈╗
║ 🛠️  𝗨𝗣𝗧𝗜𝗠𝗘 & 𝗦𝗬𝗦𝗧𝗘𝗠 𝗜𝗡𝗙𝗢
╟😈${line}😈╢
║ ⏳ 𝗨𝗽𝘁𝗶𝗺𝗲       : ${uptimeString}
║ ⚙️ 𝗖𝗣𝗨           : ${cpu} (${cores} cores)
║ 🧠 𝗥𝗔𝗠 𝗨𝘀𝗲𝗱     : ${usedMem.toFixed(2)} MB / ${totalMem.toFixed(2)} MB
║ 💾 𝗣𝗹𝗮𝘁𝗳𝗼𝗿𝗺      : ${platform} (${arch})
║ 🖥️ 𝗛𝗼𝘀𝘁𝗻𝗮𝗺𝗲      : ${hostname}
║ 🔢 𝗧𝗵𝗿𝗲𝗮𝗱𝘀      : ${totalThreads}
║ 🧩 𝗖𝗼𝗺𝗺𝗮𝗻𝗱𝘀     : ${totalCommands}
║ 🧪 𝗡𝗼𝗱𝗲.𝗷𝘀       : ${nodeVersion}
║ 🪄 𝗣𝗿𝗲𝗳𝗶𝘅        : ${prefix}
║ 👑 𝗢𝘄𝗻𝗲𝗿        : Mâybe Nx
╚😈${line}😈╝`;

      message.reply(box);
    } catch (err) {
      message.reply(`❌ Error while fetching uptime info:\n${err.message}`);
    }
  }
};
