const ChatMessage = require('../models/ChatMessage');
const Course = require('../models/Course');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sanitizePlainText } = require('../utils/sanitize');

const SYSTEM_PROMPT = `You are "Forge", the SkillForge AI Mentor — a friendly, expert career and learning advisor.
- Answer questions about courses, learning paths, careers, and job hunting.
- Be concise (under 200 words), encouraging, and practical.
- Use short paragraphs and bullet points.
- Only discuss topics related to learning, careers, and the SkillForge platform.`;

const callOpenAI = async ({ messages, courseCatalog, user }) => {
  const apiKey = process.env.OPENAI_API_KEY;
  const baseUrl = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  const contextLines = courseCatalog
    .map((c) => `- "${c.title}" [${c.category}, ${c.level}, $${c.price || 'free'}, rating ${c.ratingSummary?.average || 'N/A'}]: ${c.shortDescription}`)
    .slice(0, 25);

  const payload = {
    model,
    messages: [
      { role: 'system', content: `${SYSTEM_PROMPT}\n\nThe user's profile: ${user.role}, skills: ${user.skills.join(', ') || 'none'}, headline: ${user.headline || 'n/a'}.` },
      {
        role: 'system',
        content: `Here is the current SkillForge course catalog the user can enroll in:\n${contextLines.join('\n') || 'No courses published yet.'}`,
      },
      ...messages,
    ],
    temperature: 0.7,
    max_tokens: 400,
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`LLM API error ${response.status}: ${text.slice(0, 200)}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || 'Hmm, I could not generate a response. Please try again.';
  } finally {
    clearTimeout(timer);
  }
};

const mockMentor = async ({ message, courseCatalog, user }) => {
  const q = message.toLowerCase();
  const lower = q;

  const findCourses = (keywords) =>
    courseCatalog.filter((c) => {
      const haystack = `${c.title} ${c.shortDescription} ${c.category} ${(c.tags || []).join(' ')}`.toLowerCase();
      return keywords.some((k) => haystack.includes(k));
    });

  if (/^hi|hello|hey|salam|assalam/.test(lower)) {
    return `Hey ${user.name.split(' ')[0]}! 👋 I'm Forge, your AI mentor.\n\nI can help you:\n• Pick the right course for your goals\n• Build a career roadmap (e.g. web dev, data science, AI)\n• Prepare for interviews and job applications\n\nWhat are you hoping to achieve?\n\nCurrent catalog highlights: ${courseCatalog.slice(0, 3).map((c) => `"${c.title}"`).join(', ') || 'no courses yet'}.\n\nWant me to recommend one?`;
  }

  if (/(course|learn|study|recommend|suggest|which|best)/.test(lower)) {
    const groups = [
      { keywords: ['web', 'react', 'frontend', 'javascript', 'node', 'fullstack'], track: 'Web Development' },
      { keywords: ['python', 'data science', 'machine', 'ai', 'deep', 'analytics'], track: 'Data Science & AI' },
      { keywords: ['cloud', 'devops', 'aws', 'docker', 'kubernetes'], track: 'Cloud & DevOps' },
      { keywords: ['mobile', 'android', 'flutter', 'ios', 'react native'], track: 'Mobile Development' },
      { keywords: ['design', 'ui', 'ux', 'figma'], track: 'UI/UX Design' },
      { keywords: ['cyber', 'security', 'hack'], track: 'Cybersecurity' },
    ];

    const matched = groups.find((g) => g.keywords.some((k) => lower.includes(k)));
    let picks;
    let intro;

    if (matched) {
      picks = findCourses(matched.keywords);
      intro = `Great choice — ${matched.track} is an in-demand field right now! 🚀`;
    } else {
      picks = courseCatalog.slice(0, 4);
      intro = 'Here are some of the most popular courses on SkillForge:';
    }

    if (!picks.length) {
      return `${intro}\n\nI couldn't find a course matching that yet, but new courses are added every week. In the meantime, check the Jobs board to see what skills employers want, and pick courses that fill the gaps.`;
    }

    const lines = picks
      .slice(0, 3)
      .map((c, i) => `${i + 1}. "${c.title}" — ${c.level}, ${c.ratingSummary?.average ? `rated ${c.ratingSummary.average}/5` : 'new'}, ${c.price ? `$${c.price}` : 'FREE'}\n   ${c.shortDescription}`)
      .join('\n');

    const tip =
      matched && matched.keywords.includes('react') || matched?.keywords.includes('node')
        ? '\n\nTip: pair it with the "AI-Powered Career Prep" course to maximize your chances.'
        : '';

    return `${intro}\n\n${lines}${tip}\n\nWant me to suggest a step-by-step learning path instead?`;
  }

  if (/(job|career|interview|resume|salary|hiring|apply)/.test(lower)) {
    return `Here's how to turn your learning into a job offer 💼\n\n1. **Skills first** — employers care about projects. Build 2-3 portfolio projects from your courses.\n2. **Targeted resume** — tailor keywords per role. Upload your resume in Settings so you can apply to jobs in one click.\n3. **Apply early** — new openings on the Jobs board get flooded fast; aim to apply within 48 hours.\n4. **Practice** — expect coding challenges + behavioral questions. Review your course material before interviews.\n\nRight now the hottest postings on the board are in ${courseCatalog.length ? 'web development and AI' : 'various fields'}. Would you like to see which skills to prioritize for a specific role?`;
  }

  if (/(roadmap|path|plan|start|beginner|where do i start)/.test(lower)) {
    return `Here's a solid 3-step learning roadmap 📚\n\n**Step 1 — Foundation (weeks 1-4):** pick a beginner course in your target field and finish it 100%.\n**Step 2 — Projects (weeks 5-8):** build 2 small projects using what you learned.\n**Step 3 — Job prep (weeks 9-12):** optimize your resume, solve interview questions, and start applying.\n\nTrack your progress on your dashboard — each completed course earns a certificate you can show employers.\n\nWhich field are you targeting? I'll tailor the roadmap.`;
  }

  if (/(thank|great|awesome|nice|perfect|ok|got it)/.test(lower)) {
    return `You're welcome, ${user.name.split(' ')[0]}! 😊 Keep learning — if you need anything else (course picks, career advice, interview prep), I'm right here.`;
  }

  return `Good question! Here's my quick take 🤖\n\n• **For your learning path:** browse courses by category, and use the rating filter to find highly-reviewed material. Enrolled students can review courses.\n• **For your career:** the Jobs board shows what companies are hiring for — match your skills and apply with your saved resume.\n• **For community help:** post your question in the Forum and get answers from peers and instructors.\n\nI can also recommend specific courses based on your interests — try asking "which course should I take for web development?"`;
};

exports.history = asyncHandler(async (req, res) => {
  const messages = await ChatMessage.find({ user: req.userId }).sort({ createdAt: 1 }).limit(60);
  res.json({ success: true, messages });
});

exports.sendMessage = asyncHandler(async (req, res) => {
  const content = sanitizePlainText(req.body.message, 2000);
  if (!content) throw new ApiError(400, 'Message cannot be empty.');

  const userMessage = await ChatMessage.create({ user: req.userId, role: 'user', content });

  const [courseCatalog, history] = await Promise.all([
    Course.find({ status: 'published' })
      .select('title shortDescription category level price tags ratingSummary')
      .sort({ enrolledCount: -1 })
      .limit(30)
      .lean(),
    ChatMessage.find({ user: req.userId, role: 'user' }).sort({ createdAt: -1 }).limit(8).select('content -_id'),
  ]);

  const conversation = history
    .reverse()
    .map((m) => ({ role: 'user', content: m.content }));

  let reply;
  if (process.env.OPENAI_API_KEY) {
    try {
      reply = await callOpenAI({ messages: [...conversation, { role: 'user', content }], courseCatalog, user: req.user });
    } catch {
      reply = await mockMentor({ message: content, courseCatalog, user: req.user });
    }
  } else {
    reply = await mockMentor({ message: content, courseCatalog, user: req.user });
  }

  const assistantMessage = await ChatMessage.create({ user: req.userId, role: 'assistant', content: reply });
  res.json({ success: true, messages: [userMessage, assistantMessage], provider: process.env.OPENAI_API_KEY ? 'llm' : 'mock' });
});

exports.clearHistory = asyncHandler(async (req, res) => {
  await ChatMessage.deleteMany({ user: req.userId });
  res.json({ success: true, message: 'Chat history cleared.' });
});
