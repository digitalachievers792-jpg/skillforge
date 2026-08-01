require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const User = require('../models/User');
const Course = require('../models/Course');
const Job = require('../models/Job');
const JobApplication = require('../models/JobApplication');
const ForumPost = require('../models/ForumPost');
const ForumComment = require('../models/ForumComment');
const Review = require('../models/Review');
const Enrollment = require('../models/Enrollment');
const Certificate = require('../models/Certificate');
const Notification = require('../models/Notification');
const ChatMessage = require('../models/ChatMessage');
const RefreshToken = require('../models/RefreshToken');

const { makeSlug, randomToken } = require('../utils/helpers');

const WIPE = process.argv.includes('--wipe');
const PASSWORD = 'Password@123';
const THUMBS = [
  'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=60',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=60',
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=60',
  'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800&q=60',
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=60',
  'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=800&q=60',
];

const videos = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
];

const section = (title, lessons) => ({ title, lessons });
const lesson = (title, duration) => ({
  title,
  description: `In this lesson we cover "${title}" with practical examples and a hands-on project.`,
  duration,
  videoUrl: videos[Math.floor(Math.random() * videos.length)],
  isFree: false,
});

const courseSeed = [
  {
    title: 'Full-Stack Web Development with the MERN Stack',
    category: 'Web Development',
    level: 'beginner',
    price: 0,
    shortDescription: 'Build real apps from scratch: React, Node.js, Express, and MongoDB with projects.',
    description:
      '<p>Learn to build complete web applications using the MERN stack. You will go from zero to deploying full-stack projects with authentication, databases, and modern UI.</p><ul><li>React + Vite fundamentals</li><li>REST APIs with Express</li><li>MongoDB data modeling</li><li>Authentication & security best practices</li><li>Deploy to production</li></ul>',
    tags: ['react', 'node', 'mongodb', 'javascript'],
    curriculum: [
      section('Getting Started', [lesson('Course overview & setup', 8), lesson('Installing Node.js and MongoDB', 12)]),
      section('React Essentials', [lesson('Components and props', 25), lesson('State and hooks', 32), lesson('Routing with React Router', 28)]),
      section('Building the API', [lesson('Express server setup', 22), lesson('Mongoose models and schemas', 30), lesson('Auth with JWT', 35)]),
      section('Going Live', [lesson('Deploying with Render/Vercel', 18)]),
    ],
  },
  {
    title: 'Data Science & Machine Learning Bootcamp',
    category: 'Data Science',
    level: 'intermediate',
    price: 2999,
    shortDescription: 'Python, pandas, scikit-learn, and deep learning — from analysis to models.',
    description:
      '<p>A hands-on bootcamp that teaches data analysis and machine learning with Python. You will work on real datasets and build predictive models step by step.</p><ul><li>NumPy and pandas mastery</li><li>Data visualization with matplotlib</li><li>Regression and classification</li><li>Intro to neural networks</li></ul>',
    tags: ['python', 'data-science', 'ai', 'machine-learning'],
    curriculum: [
      section('Python for Data', [lesson('Environment setup with Anaconda', 15), lesson('NumPy essentials', 28), lesson('pandas DataFrames', 35)]),
      section('Machine Learning', [lesson('Linear regression', 30), lesson('Classification with scikit-learn', 40), lesson('Model evaluation', 25)]),
    ],
  },
  {
    title: 'Modern React & TypeScript — The Complete Guide',
    category: 'Web Development',
    level: 'intermediate',
    price: 1999,
    shortDescription: 'Typed, testable, production-grade React apps with hooks, context, and Vite.',
    description:
      '<p>Take your React skills to production quality with TypeScript, modern patterns, and testing.</p><ul><li>TypeScript fundamentals</li><li>Custom hooks and context</li><li>Testing with Vitest</li><li>Performance optimization</li></ul>',
    tags: ['react', 'typescript', 'frontend'],
    curriculum: [
      section('TypeScript Fundamentals', [lesson('Why TypeScript', 12), lesson('Types and interfaces', 24)]),
      section('Advanced React', [lesson('Custom hooks deep dive', 26), lesson('Context vs Redux', 22), lesson('Code splitting', 18)]),
    ],
  },
  {
    title: 'AWS Cloud & DevOps for Beginners',
    category: 'Cloud & DevOps',
    level: 'beginner',
    price: 3499,
    shortDescription: 'EC2, S3, Docker, CI/CD pipelines — everything you need to ship software like a pro.',
    description:
      '<p>Understand cloud computing and DevOps culture with hands-on AWS labs and Docker containers.</p><ul><li>EC2 and S3 essentials</li><li>Docker and containers</li><li>CI/CD with GitHub Actions</li><li>Monitoring basics</li></ul>',
    tags: ['aws', 'devops', 'cloud', 'docker'],
    curriculum: [
      section('Cloud Basics', [lesson('Intro to AWS', 15), lesson('EC2 instances', 30), lesson('S3 storage', 22)]),
      section('DevOps', [lesson('Docker fundamentals', 35), lesson('CI/CD pipelines', 28), lesson('Monitoring & logs', 20)]),
    ],
  },
  {
    title: 'AI Chatbot Development with LLMs',
    category: 'Artificial Intelligence',
    level: 'advanced',
    price: 4999,
    shortDescription: 'Build and deploy AI chatbots using LLM APIs, RAG pipelines, and prompt engineering.',
    description:
      '<p>Design intelligent assistants with large language models. Learn prompt engineering, retrieval-augmented generation, and safe deployment.</p><ul><li>LLM fundamentals</li><li>Prompt engineering patterns</li><li>RAG with vector databases</li><li>Streaming responses</li></ul>',
    tags: ['ai', 'python', 'llm', 'chatbot'],
    curriculum: [
      section('LLM Foundations', [lesson('How LLMs work', 20), lesson('Prompt engineering', 32)]),
      section('Building Assistants', [lesson('RAG pipelines', 38), lesson('Vector databases', 30), lesson('Deploying chatbots', 25)]),
    ],
  },
  {
    title: 'UI/UX Design: Figma to Code',
    category: 'UI/UX Design',
    level: 'beginner',
    price: 1499,
    shortDescription: 'Design beautiful interfaces in Figma and turn them into pixel-perfect React code.',
    description:
      '<p>Master the design-to-code workflow: wireframes, design systems in Figma, and implementing with Tailwind CSS.</p><ul><li>Design fundamentals</li><li>Figma components and variants</li><li>Design systems</li><li>Tailwind implementation</li></ul>',
    tags: ['ui', 'ux', 'figma', 'design'],
    curriculum: [
      section('Design Basics', [lesson('Principles of UI design', 18), lesson('Color and typography', 20)]),
      section('Figma to Code', [lesson('Building a design system', 30), lesson('Tailwind implementation', 28)]),
    ],
  },
  {
    title: 'Cybersecurity Essentials & Ethical Hacking',
    category: 'Cybersecurity',
    level: 'intermediate',
    price: 3999,
    shortDescription: 'Network security, OWASP Top 10, and hands-on ethical hacking labs.',
    description:
      '<p>Learn how attackers think and how to defend. Covers network security, web vulnerabilities, and responsible disclosure.</p><ul><li>Networking fundamentals</li><li>OWASP Top 10</li><li>Penetration testing intro</li><li>Security best practices</li></ul>',
    tags: ['security', 'hacking', 'owasp'],
    curriculum: [
      section('Foundations', [lesson('Security mindset', 15), lesson('Networking essentials', 30)]),
      section('Web Security', [lesson('OWASP Top 10', 40), lesson('CTF walkthroughs', 30)]),
    ],
  },
  {
    title: 'Career Kickstart: Resume, LinkedIn & Interviews',
    category: 'Career Preparation',
    level: 'all-levels',
    price: 999,
    shortDescription: 'A practical guide to landing your first tech job — resume, portfolio, and interviews.',
    description:
      '<p>Prepare for the job market with a professional resume, a compelling LinkedIn profile, and mock interview practice.</p><ul><li>Resume writing</li><li>LinkedIn optimization</li><li>Interview preparation</li><li>Salary negotiation</li></ul>',
    tags: ['career', 'interview', 'job-search'],
    curriculum: [
      section('Your Profile', [lesson('Writing a killer resume', 22), lesson('LinkedIn optimization', 18)]),
      section('Interviews', [lesson('Behavioral interviews', 25), lesson('Technical interview practice', 35), lesson('Salary negotiation', 15)]),
    ],
  },
];

const jobSeed = [
  {
    title: 'Senior React Developer',
    company: 'TechNova Solutions',
    locationCity: 'Lahore',
    locationCountry: 'Pakistan',
    type: 'full-time',
    mode: 'hybrid',
    salaryMin: 250000,
    salaryMax: 400000,
    currency: 'Rs',
    tags: ['react', 'typescript', 'frontend'],
    description:
      '<p>We are looking for a senior React developer to lead our frontend team building scalable SaaS products.</p><ul><li>5+ years of experience</li><li>Strong TypeScript skills</li><li>Experience with testing frameworks</li></ul>',
    requirements: ['5+ years frontend experience', 'Deep React & TypeScript knowledge', 'Leadership experience is a plus'],
  },
  {
    title: 'Machine Learning Engineer',
    company: 'DataPulse AI',
    locationCity: 'Karachi',
    locationCountry: 'Pakistan',
    type: 'full-time',
    mode: 'remote',
    salaryMin: 350000,
    salaryMax: 550000,
    currency: 'Rs',
    tags: ['python', 'machine-learning', 'ai'],
    description:
      '<p>Join our ML team to build recommendation systems and NLP solutions for enterprise clients.</p><ul><li>Strong Python skills</li><li>Experience with TensorFlow or PyTorch</li></ul>',
    requirements: ['3+ years ML experience', 'Production ML deployments', 'Good communication skills'],
  },
  {
    title: 'Full-Stack Node.js Developer (Internship)',
    company: 'StartHub Incubator',
    locationCity: 'Islamabad',
    locationCountry: 'Pakistan',
    type: 'internship',
    mode: 'onsite',
    salaryMin: 40000,
    salaryMax: 70000,
    currency: 'Rs',
    tags: ['node', 'mongodb', 'javascript'],
    description:
      '<p>Six-month paid internship working on real products with mentorship from senior engineers.</p><ul><li>React or Node basics required</li><li>Eagerness to learn</li></ul>',
    requirements: ['Basic JavaScript', 'Any MERN project in portfolio'],
  },
  {
    title: 'UI/UX Designer (Freelance)',
    company: 'PixelCraft Studio',
    locationCity: 'Remote',
    locationCountry: 'Worldwide',
    type: 'freelance',
    mode: 'remote',
    salaryMin: 1500,
    salaryMax: 2500,
    currency: '$',
    tags: ['ui', 'ux', 'figma'],
    description:
      '<p>Design modern dashboards and mobile apps for international clients. Work on your own schedule.</p><ul><li>Figma proficiency</li><li>Portfolio required</li></ul>',
    requirements: ['2+ years design experience', 'Strong portfolio'],
  },
  {
    title: 'DevOps Engineer',
    company: 'CloudNine Systems',
    locationCity: 'Dubai',
    locationCountry: 'UAE',
    type: 'full-time',
    mode: 'onsite',
    salaryMin: 12000,
    salaryMax: 18000,
    currency: 'AED',
    tags: ['aws', 'docker', 'devops'],
    description:
      '<p>Own our CI/CD infrastructure and help scale Kubernetes clusters serving millions of requests.</p><ul><li>AWS certified preferred</li><li>Docker & Kubernetes</li></ul>',
    requirements: ['4+ years DevOps experience', 'Kubernetes in production', 'Infrastructure as Code (Terraform)'],
  },
  {
    title: 'Cybersecurity Analyst',
    company: 'SecureShield Pvt Ltd',
    locationCity: 'Rawalpindi',
    locationCountry: 'Pakistan',
    type: 'contract',
    mode: 'hybrid',
    salaryMin: 200000,
    salaryMax: 320000,
    currency: 'Rs',
    tags: ['security', 'networking'],
    description:
      '<p>Monitor systems, respond to incidents, and run vulnerability assessments across our client networks.</p><ul><li>CEH or equivalent certification a plus</li></ul>',
    requirements: ['2+ years security experience', 'Understanding of OWASP Top 10', 'SIEM experience'],
  },
];

const forumSeed = [
  {
    title: 'How do I choose my first tech specialization?',
    tags: ['career', 'beginner'],
    body: '<p>I just finished learning HTML/CSS/JS basics. Should I go deeper into frontend, backend, or data science? What would you recommend for someone who enjoys problem solving?</p>',
    pinned: true,
  },
  {
    title: 'Best resources for learning React in 2026?',
    tags: ['react', 'javascript'],
    body: '<p>There are so many tutorials out there. What course or documentation helped you the most when learning React? Also any advice on avoiding tutorial hell?</p>',
  },
  {
    title: 'How to prepare for technical interviews at local companies?',
    tags: ['interview', 'career'],
    body: '<p>What should I focus on: DSA, system design, or projects? Any experience with interviews at Pakistani startups vs international remote roles?</p>',
  },
  {
    title: 'Freelancing vs full-time: which is better for juniors?',
    tags: ['career', 'job-search'],
    body: '<p>I have built 3-4 projects and I am wondering whether to apply for jobs or start freelancing on Upwork. What worked for you?</p>',
  },
  {
    title: 'Is MongoDB better than PostgreSQL for a new project?',
    tags: ['node', 'mongodb'],
    body: '<p>Building an e-commerce app with React and Node. Which database should I pick and why? I care about reliability and future scaling.</p>',
  },
];

const commentSeed = [
  { text: 'Great question! I would recommend frontend first since it gives you visual feedback fast and keeps motivation high.', answer: true },
  { text: 'Agreed with frontend, but do not neglect backend fundamentals — build a couple of full-stack clones to decide.', answer: false },
  { text: 'The official React docs are actually amazing now. Pair them with building a real project, not tutorial videos.', answer: false },
  { text: 'Avoid tutorial hell by building something you actually need. I built a budget tracker and learned more than any course.', answer: true },
  { text: 'For Pakistani companies, DSA basics + solid projects matter most. For remote international roles, communication and system design start mattering.', answer: false },
  { text: 'Start freelancing in parallel. A couple of small gigs will teach you client communication which jobs rarely do.', answer: false },
];

const reviewTitles = [
  'Exactly what I needed',
  'Clear and practical',
  'A bit fast at the end',
  'Worth every rupee',
  'Great instructor',
];

async function wipeAll() {
  const collections = [
    User, Course, Job, JobApplication, ForumPost, ForumComment, Review, Enrollment,
    Certificate, Notification, ChatMessage, RefreshToken,
  ];
  for (const model of collections) await model.deleteMany({});
  console.log('[seed] Cleared all collections.');
}

async function seed({ skipDisconnect = false } = {}) {
  await connectDB();
  if (WIPE) await wipeAll();

  console.log('[seed] Creating users…');
  const admin = await User.create({
    name: 'Admin SkillForge',
    email: 'admin@skillforge.dev',
    password: PASSWORD,
    role: 'admin',
    emailVerified: true,
    headline: 'Platform Administrator',
    location: 'Lahore, Pakistan',
  });

  const instructors = [];
  const instructorDefs = [
    { name: 'Ayesha Khan', email: 'ayesha@skillforge.dev', headline: 'Senior Full-Stack Engineer', skills: ['React', 'Node.js', 'MongoDB', 'TypeScript'], github: 'https://github.com/ayesha-dev' },
    { name: 'Bilal Ahmed', email: 'bilal@skillforge.dev', headline: 'Data Scientist & ML Educator', skills: ['Python', 'pandas', 'scikit-learn', 'Deep Learning'], linkedin: 'https://linkedin.com/in/bilal-ahmed' },
    { name: 'Sana Malik', email: 'sana@skillforge.dev', headline: 'Cloud Architect & DevOps Coach', skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD'], website: 'https://sanamalik.dev' },
    { name: 'Usman Tariq', email: 'usman@skillforge.dev', headline: 'AI Engineer — LLMs & Chatbots', skills: ['Python', 'LLMs', 'RAG', 'LangChain'], twitter: 'https://x.com/usman_ai' },
  ];
  for (const def of instructorDefs) {
    const u = await User.create({
      name: def.name,
      email: def.email,
      password: PASSWORD,
      role: 'instructor',
      emailVerified: true,
      headline: def.headline,
      skills: def.skills,
      location: def.location || 'Pakistan',
      bio: `${def.name} teaches on SkillForge with years of industry experience.`,
      socials: { website: def.website || '', github: def.github || '', linkedin: def.linkedin || '', twitter: def.twitter || '' },
    });
    instructors.push(u);
  }

  const students = [];
  const studentNames = [
    ['Hassan Raza', 'hassan@example.com'],
    ['Fatima Noor', 'fatima@example.com'],
    ['Ali Hamza', 'ali@example.com'],
    ['Zainab Shah', 'zainab@example.com'],
    ['Omar Farooq', 'omar@example.com'],
    ['Mahnoor Siddiqui', 'mahnoor@example.com'],
    ['Daniyal Iqbal', 'daniyal@example.com'],
    ['Areeba Javed', 'areeba@example.com'],
  ];
  for (const [name, email] of studentNames) {
    const s = await User.create({
      name,
      email,
      password: PASSWORD,
      role: 'student',
      emailVerified: true,
      headline: name.split(' ')[0] === 'Zainab' ? 'Aspiring Data Analyst' : 'Frontend Developer in training',
      location: ['Lahore', 'Karachi', 'Islamabad', 'Multan', 'Faisalabad'][Math.floor(Math.random() * 5)],
      skills: ['JavaScript', 'HTML', 'CSS'],
    });
    students.push(s);
  }

  console.log('[seed] Creating courses…');
  const courses = [];
  for (let i = 0; i < courseSeed.length; i++) {
    const def = courseSeed[i];
    const slugBase = makeSlug(def.title);
    const course = await Course.create({
      title: def.title,
      slug: `${slugBase}-${i + 1}`,
      shortDescription: def.shortDescription,
      description: def.description,
      category: def.category,
      level: def.level,
      price: def.price,
      thumbnail: THUMBS[i % THUMBS.length],
      tags: def.tags,
      curriculum: def.curriculum,
      instructor: instructors[i % instructors.length]._id,
      status: 'published',
      featured: i < 4,
      publishedAt: new Date(Date.now() - (10 - i) * 24 * 60 * 60 * 1000),
    });
    courses.push(course);
  }

  console.log('[seed] Creating jobs…');
  const jobs = [];
  for (let i = 0; i < jobSeed.length; i++) {
    const def = jobSeed[i];
    const job = await Job.create({
      title: def.title,
      company: def.company,
      locationCity: def.locationCity,
      locationCountry: def.locationCountry,
      type: def.type,
      mode: def.mode,
      salaryMin: def.salaryMin,
      salaryMax: def.salaryMax,
      currency: def.currency,
      tags: def.tags,
      description: def.description,
      requirements: def.requirements,
      status: 'open',
      postedBy: instructors[i % instructors.length]._id,
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    });
    jobs.push(job);
  }

  console.log('[seed] Creating enrollments, reviews & certificates…');
  const enrollments = [];
  const flatLessons = (course) => course.curriculum.flatMap((s) => s.lessons);
  const ratingAccum = new Map();
  for (let si = 0; si < students.length; si++) {
    const student = students[si];
    for (let ci = 0; ci < Math.min(3, courses.length); ci++) {
      const course = courses[(si + ci * 2) % courses.length];
      const lessons = flatLessons(course);
      const doneCount = ci === 0 ? lessons.length : Math.floor((si % 5) / 5 * lessons.length) + 2;
      const doneIds = lessons.slice(0, Math.min(doneCount, lessons.length)).map((l) => l._id);
      const completed = doneIds.length >= lessons.length;
      const enrollment = await Enrollment.create({
        user: student._id,
        course: course._id,
        status: completed ? 'completed' : 'active',
        completedLessons: doneIds,
        progressPercent: Math.round((doneIds.length / Math.max(lessons.length, 1)) * 100),
        enrolledAt: new Date(Date.now() - (10 - ci) * 3 * 24 * 60 * 60 * 1000),
      });
      await Course.updateOne({ _id: course._id }, { $inc: { enrolledCount: 1 } });
      if (completed) {
        const certificate = await Certificate.create({
          user: student._id,
          course: course._id,
          code: randomToken(5).toUpperCase(),
        });
        enrollment.certificate = certificate._id;
        await enrollment.save();
      }
      enrollments.push(enrollment);

      if (enrollment.progressPercent >= 40) {
        const rating = 3 + ((si + ci) % 3);
        await Review.create({
          user: student._id,
          course: course._id,
          rating,
          title: reviewTitles[(si + ci) % reviewTitles.length],
          body: `I really enjoyed this course. The ${(course.curriculum[1]?.title || 'lessons').toLowerCase()} section was especially helpful. Highly recommended for beginners!`,
        });
        const acc = ratingAccum.get(course._id.toString()) || { sum: 0, count: 0 };
        acc.sum += rating;
        acc.count += 1;
        ratingAccum.set(course._id.toString(), acc);
      }
    }
  }

  for (const [courseId, acc] of ratingAccum) {
    await Course.updateOne(
      { _id: courseId },
      { $set: { 'ratingSummary.average': Math.round((acc.sum / acc.count) * 10) / 10, 'ratingSummary.count': acc.count } }
    );
  }

  console.log('[seed] Creating forum posts & comments…');
  const posts = [];
  for (let i = 0; i < forumSeed.length; i++) {
    const def = forumSeed[i];
    const post = await ForumPost.create({
      title: def.title,
      body: def.body,
      tags: def.tags,
      author: students[i % students.length]._id,
      pinned: def.pinned || false,
      score: (i + 1) * 4,
      views: (i + 1) * 37,
      createdAt: new Date(Date.now() - i * 2 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - i * 2 * 24 * 60 * 60 * 1000),
    });
    posts.push(post);

    const relevantComments = commentSeed.slice(i, i + 2);
    for (const c of relevantComments) {
      await ForumComment.create({
        post: post._id,
        author: instructors[i % instructors.length]._id,
        body: `<p>${c.text}</p>`,
        score: 3 + i,
        isAnswer: c.answer,
      });
    }
    await ForumPost.updateOne({ _id: post._id }, { $inc: { commentCount: relevantComments.length } });
  }

  console.log('[seed] Creating applications & notifications…');
  for (let i = 0; i < 4; i++) {
    await JobApplication.create({
      job: jobs[i % jobs.length]._id,
      user: students[i]._id,
      name: students[i].name,
      email: students[i].email,
      phone: `+92 3XX ${1000000 + i * 111111}`,
      coverLetter: `I am excited to apply for this role. I have been learning through SkillForge and built several projects to prepare for this position.`,
      status: i % 2 === 0 ? 'pending' : 'shortlisted',
    });
    await Job.updateOne({ _id: jobs[i % jobs.length]._id }, { $inc: { applicantsCount: 1 } });
  }

  for (let i = 0; i < students.length; i++) {
    await Notification.create({
      recipient: students[i]._id,
      type: 'system',
      title: 'Welcome to SkillForge 🎉',
      message: 'Explore courses, jobs, and the community forum to kickstart your career!',
      link: '/courses',
      isRead: i % 2 === 0,
    });
  }

  console.log('[seed] Creating chat history…');
  await ChatMessage.create({
    user: students[0]._id,
    role: 'user',
    content: 'What should I learn to become a full-stack developer?',
  });
  await ChatMessage.create({
    user: students[0]._id,
    role: 'assistant',
    content: 'Great question! Start with HTML/CSS, then JavaScript, pick React for the frontend, and Node.js + MongoDB for the backend. Check our MERN course to get started! 🚀',
  });

  console.log('\n========== SEED COMPLETE ==========');
  console.log(`Admin:       admin@skillforge.dev  / ${PASSWORD}`);
  console.log(`Instructors: ayesha@, bilal@, sana@, usman@skillforge.dev  / ${PASSWORD}`);
  console.log(`Students:    hassan@, fatima@, ali@, zainab@, omar@, mahnoor@, daniyal@, areeba@example.com  / ${PASSWORD}`);
  console.log(`Courses:     ${courses.length}  Jobs: ${jobs.length}  Posts: ${posts.length}  Enrollments: ${enrollments.length}`);
  console.log('====================================');

  if (!skipDisconnect) await mongoose.disconnect();
  if (require.main === module) process.exit(0);
  return { courses: courses.length, jobs: jobs.length, posts: posts.length, enrollments: enrollments.length };
}

const seedIfEmpty = async () => {
  await connectDB();
  const count = await User.countDocuments();
  if (count > 0) {
    console.log(`[seed] Database already has ${count} users — skipping seed.`);
    return null;
  }
  console.log('[seed] Empty database detected — seeding demo data...');
  return seed({ skipDisconnect: true });
};

if (require.main === module) {
  seed().catch((err) => {
    console.error('[seed] Failed:', err.message);
    process.exit(1);
  });
} else {
  module.exports = { seedIfEmpty };
}
