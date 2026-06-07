const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });

admin.initializeApp();

exports.generateQuest = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).send({ error: "Method not allowed" });
    }

    const profile = req.body?.profile || {};
    const tier = req.body?.tier || "Bronze";
    return res.status(200).json([
      {
        title: `Demo ${tier} quest`,
        description: `A placeholder quest generated for ${profile.athleticLevel || 'a brave adventurer'}.`,
        tier,
        xpReward: 100,
        tags: ["demo"],
        estimatedTime: "1 hour",
        requirements: ["none"]
      }
    ]);
  });
});
