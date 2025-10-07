const UNSEND_EMOJIS = ["😾", "😡", "🤬"]; // এখানে তুমি ইচ্ছা মতো ইমোজি যোগ করতে পারো

module.exports = {
  config: {
    name: "unsend",
    aliases: ["u", "uns"],
    version: "2.1",
    author: "nx",
    role: 0,
    description: "Automatically unsends a message when someone reacts with 😾, 😡, or 🤬",
    category: "reaction"
  },

  // 🟢 GoatBot এই ফাংশনটি ইনস্টল চেক করার সময় খোঁজে, তাই খালি রাখলেও দিতে হবে
  onStart: async function () {
    // কোনো কিছু না করলেও সমস্যা নেই
  },

  // 🟡 এই অংশটাই মূল কাজ করবে
  onReaction: async function ({ event, api }) {
    try {
      const { reaction, messageID } = event;

      // যদি রিঅ্যাকশন আমাদের নির্ধারিত ইমোজির মধ্যে থাকে
      if (UNSEND_EMOJIS.includes(reaction)) {
        try {
          await api.unsendMessage(messageID);
          console.log(`✅ Message unsent due to reaction: ${reaction}`);
        } catch (err) {
          console.error("❌ Failed to unsend message:", err);
        }
      }
    } catch (err) {
      console.error("⚠️ Error in unsend.js:", err);
    }
  }
};
