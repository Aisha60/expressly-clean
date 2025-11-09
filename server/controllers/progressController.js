import SpeechResult from "../models/SpeechResult.js";
import VideoResult from "../models/VideoResult.js";
import TextResult from "../models/TextResult.js";
import User from "../models/User.js";

// Helper to normalize different result documents into a session summary
function normalizeResult(doc, type) {
  if (!doc) return null;
  const base = {
    id: doc._id,
    type: type,
    userId: doc.userId || doc.user || null,
    timestamp: doc.createdAt || doc.timestamp || doc.date || null,
    raw: doc
  };

  if (type === 'speech') {
    base.score = doc.scoring?.overallScore ?? null;
    base.summary = doc.summary ?? null;
  } else if (type === 'video') {
    base.score = doc.overall?.score ?? null;
    base.summary = doc.overall?.feedback ?? null;
  } else if (type === 'text') {
    base.score = doc.analysisResults?.overall_score ?? null;
    base.summary = doc.suggestions ?? null;
  }

  return base;
}

export const getSessions = async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const [speech, video, text] = await Promise.all([
      SpeechResult.find({ userId }).sort({ createdAt: -1 }).limit(200).lean(),
      VideoResult.find({ userId }).sort({ createdAt: -1 }).limit(200).lean(),
      TextResult.find({ userId }).sort({ createdAt: -1 }).limit(200).lean(),
    ]);

    const sessions = [];
    speech.forEach(s => sessions.push(normalizeResult(s, 'speech')));
    video.forEach(v => sessions.push(normalizeResult(v, 'video')));
    text.forEach(t => sessions.push(normalizeResult(t, 'text')));

    sessions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return res.json({ success: true, sessions });
  } catch (e) {
    console.error('getSessions error', e);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getSummary = async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const [speechAgg] = await SpeechResult.aggregate([
      { $match: { userId } },
      { $group: { _id: null, avg: { $avg: "$scoring.overallScore" } } }
    ]);

    const [videoAgg] = await VideoResult.aggregate([
      { $match: { userId } },
      { $group: { _id: null, avg: { $avg: "$overall.score" } } }
    ]);

    const [textAgg] = await TextResult.aggregate([
      { $match: { userId } },
      { $group: { _id: null, avg: { $avg: "$analysisResults.overall_score" } } }
    ]);

    const speechAvg = (speechAgg && speechAgg.avg) ? Number(speechAgg.avg.toFixed(2)) : null;
    const videoAvg = (videoAgg && videoAgg.avg) ? Number(videoAgg.avg.toFixed(2)) : null;
    const textAvg = (textAgg && textAgg.avg) ? Number(textAgg.avg.toFixed(2)) : null;

    const parts = [speechAvg, videoAvg, textAvg].filter(v => v !== null);
    const overall = parts.length ? Number((parts.reduce((a,b)=>a+b,0)/parts.length).toFixed(2)) : null;

    return res.json({ success: true, summary: { speechAvg, videoAvg, textAvg, overall } });
  } catch (e) {
    console.error('getSummary error', e);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getSessionById = async (req, res) => {
  try {
    const { id, type } = req.params;
    if (!id || !type) return res.status(400).json({ error: 'id and type required' });

    let doc = null;
    if (type === 'speech') doc = await SpeechResult.findById(id).lean();
    else if (type === 'video') doc = await VideoResult.findById(id).lean();
    else if (type === 'text') doc = await TextResult.findById(id).lean();
    if (!doc) return res.status(404).json({ error: 'Session not found' });

    return res.json({ success: true, session: doc });
  } catch (e) {
    console.error('getSessionById error', e);
    res.status(500).json({ error: 'Server error' });
  }
};

// Leaderboard: top performers over a time window (default 7 days)
export const getLeaderboard = async (req, res) => {
  try {
    const type = req.query.type || 'overall'; // overall | speech | video | text
    const periodDays = Number(req.query.days || 7);
    const since = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);

    // Aggregate per-user averages depending on type
    let pipeline = [];
    if (type === 'speech' || type === 'overall') {
      pipeline.push({ $match: { createdAt: { $gte: since } } });
      pipeline.push({ $group: { _id: "$userId", avgScore: { $avg: "$scoring.overallScore" } } });
      pipeline.push({ $sort: { avgScore: -1 } });
      pipeline.push({ $limit: 50 });
      const speechRanks = await SpeechResult.aggregate(pipeline);
      // join with users
      const enriched = await Promise.all(speechRanks.map(async r=>{
        const u = await User.findById(r._id).lean();
        return { userId: r._id, name: u?.name || u?.email || 'Anonymous', score: Number((r.avgScore||0).toFixed(2)) };
      }));
      if (type === 'speech') return res.json({ success:true, leaderboard: enriched });

      // if overall, we fall-through to compute combined ranking below
    }

    // For overall or other types compute a simple combined ranking using available collections
    const users = await User.find({}).lean();
    const results = await Promise.all(users.map(async u=>{
      const uid = u._id.toString();
      const [sAgg] = await SpeechResult.aggregate([{ $match: { userId: uid, createdAt: { $gte: since } } },{ $group: { _id: null, avg: { $avg: "$scoring.overallScore" } } }]);
      const [vAgg] = await VideoResult.aggregate([{ $match: { userId: uid, createdAt: { $gte: since } } },{ $group: { _id: null, avg: { $avg: "$overall.score" } } }]);
      const [tAgg] = await TextResult.aggregate([{ $match: { userId: uid, createdAt: { $gte: since } } },{ $group: { _id: null, avg: { $avg: "$analysisResults.overall_score" } } }]);
      const vals = [sAgg?.avg, vAgg?.avg, tAgg?.avg].filter(x=>typeof x === 'number');
      const avg = vals.length ? Number((vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(2)) : null;
      return { userId: uid, name: u.name||u.email||'Anonymous', score: avg };
    }));

    const filtered = results.filter(r=>r.score !== null).sort((a,b)=>b.score - a.score).slice(0,50);
    return res.json({ success: true, leaderboard: filtered });
  } catch (e) {
    console.error('getLeaderboard error', e);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getBadges = async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const now = new Date();
    const since7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const since30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Total points in last 7 days
    const recentSpeech = await SpeechResult.find({ userId, createdAt: { $gte: since7 } }).lean();
    const recentVideo = await VideoResult.find({ userId, createdAt: { $gte: since7 } }).lean();
    const recentText = await TextResult.find({ userId, createdAt: { $gte: since7 } }).lean();

    const sumPoints7 = [
      ...recentSpeech.map(s => Number(s.scoring?.overallScore || 0)),
      ...recentVideo.map(v => Number(v.overall?.score || 0)),
      ...recentText.map(t => Number(t.analysisResults?.overall_score || 0)),
    ].reduce((a,b)=>a+b,0);

    const sessionCount7 = recentSpeech.length + recentVideo.length + recentText.length;

    // Averages over 30 days
    const [speech30] = await SpeechResult.aggregate([
      { $match: { userId, createdAt: { $gte: since30 } } },
      { $group: { _id: null, avg: { $avg: "$scoring.overallScore" } } }
    ]);
    const [video30] = await VideoResult.aggregate([
      { $match: { userId, createdAt: { $gte: since30 } } },
      { $group: { _id: null, avg: { $avg: "$overall.score" } } }
    ]);
    const [text30] = await TextResult.aggregate([
      { $match: { userId, createdAt: { $gte: since30 } } },
      { $group: { _id: null, avg: { $avg: "$analysisResults.overall_score" } } }
    ]);

    const speechAvg30 = speech30?.avg ?? null;
    const videoAvg30 = video30?.avg ?? null;
    const textAvg30 = text30?.avg ?? null;

    const badges = [];

    // Rising Star: 100+ points in last 7 days
    badges.push({ id: 'rising_star', name: 'Rising Star', description: 'Earn 100+ total points in a week', earned: sumPoints7 >= 100 });

    // Consistent Practitioner: 5+ sessions in last 7 days
    badges.push({ id: 'consistent_practitioner', name: 'Consistent Practitioner', description: 'Complete 5+ practice sessions in a week', earned: sessionCount7 >= 5 });

    // Top Communicator: speech average >=85 in last 30 days
    badges.push({ id: 'top_communicator', name: 'Top Communicator', description: 'Average speech score >= 85 over 30 days', earned: speechAvg30 !== null && speechAvg30 >= 85 });

    // Grammar Guru: text average >=85 in last 30 days
    badges.push({ id: 'grammar_guru', name: 'Grammar Guru', description: 'Average writing score >= 85 over 30 days', earned: textAvg30 !== null && textAvg30 >= 85 });

    // Body Language Ace: video average >=85 in last 30 days
    badges.push({ id: 'body_language_ace', name: 'Body Language Ace', description: 'Average non-verbal score >= 85 over 30 days', earned: videoAvg30 !== null && videoAvg30 >= 85 });

    return res.json({ success: true, badges });
  } catch (e) {
    console.error('getBadges error', e);
    res.status(500).json({ error: 'Server error' });
  }
};
