import GameSession from "../models/GameSession.js";

export const gameStart = async (req, res) => {
  try {
    const userId = req.user.id;

    // create new game session
    const session = await GameSession.create({
      userId,
    });

    // send session id to frontend
    res.status(201).json({
      success: true,
      sessionId: session._id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Unable to start game",
    });
  }
};


export const gameEnd = async (req, res) => {
  try {
    const { score, gamePlayedTime,sessionId, } = req.body;
   
    const userId = req.user.id;

    const session = await GameSession.findOne({
      _id: sessionId,
      userId,
      endedAt: null,
    });

    if(!session){
         return res.status(404).json({
        success: false,
        message: "No active game session found"
      });
    }

    session.score = score;
    session.totalTime = gamePlayedTime;
    session.endedAt = new Date();

    await session.save();

    res.status(200).json({
      success: true,
      message: "Game session ended successfully",
    });
  } catch (error) {
    console.error("Game end error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to end game",
    });
  }
};



export const getPlayerStat = async (req, res) => {
  try {
    const stats = await GameSession.aggregate([
      {
        $match: { endedAt: { $ne: null } }
      },

      // 1️⃣ GROUP PLAYER DATA
      {
        $group: {
          _id: "$userId",
          totalSessions: { $sum: 1 },
          totalScore: { $sum: "$score" },
          bestScore: { $max: "$score" },
          totalTime: { $sum: "$totalTime" },
          avgSurvivalTime: { $avg: "$totalTime" }
        }
      },

      // 2️⃣ BASE LEVEL INDEX (0–4)
      {
        $addFields: {
          baseLevelIndex: {
            $switch: {
              branches: [
                { case: { $lt: ["$avgSurvivalTime", 30] }, then: 0 }, // Bronze
                { case: { $lt: ["$avgSurvivalTime", 60] }, then: 1 }, // Silver
                { case: { $lt: ["$avgSurvivalTime", 120] }, then: 2 }, // Gold
                { case: { $lt: ["$avgSurvivalTime", 240] }, then: 3 }, // Platinum
              ],
              default: 4 // Diamond
            }
          }
        }
      },

      // 3️⃣ SCORE BOOST
      {
        $addFields: {
          scoreBoost: {
            $switch: {
              branches: [
                { case: { $gte: ["$bestScore", 100] }, then: 2 },
                { case: { $gte: ["$bestScore", 50] }, then: 1 }
              ],
              default: 0
            }
          }
        }
      },

      // 4️⃣ FINAL LEVEL INDEX (CLAMPED)
      {
        $addFields: {
          finalLevelIndex: {
            $min: [
              { $add: ["$baseLevelIndex", "$scoreBoost"] },
              4
            ]
          }
        }
      },

      // 5️⃣ LEVEL NAME
      {
        $addFields: {
          level: {
            $arrayElemAt: [
              ["Bronze", "Silver", "Gold", "Platinum", "Diamond"],
              "$finalLevelIndex"
            ]
          }
        }
      },

      // 6️⃣ JOIN USER
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },

      // 7️⃣ FINAL RESPONSE
      {
        $project: {
          _id: 0,
          userId: "$_id",
          username: "$user.username",
          level: 1,
          bestScore: 1,
          avgSurvivalTime: { $round: ["$avgSurvivalTime", 1] },
          totalSessions: 1,
          totalTime: 1,
          totalScore:1
        }
      }
    ]);

    res.json({ success: true, stats });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
