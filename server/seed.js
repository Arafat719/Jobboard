import 'dotenv/config';
import connectDB from './config/db.js';
import User from './models/User.js';
import Job from './models/Job.js';
import Application from './models/Application.js';

const USERS = [
  { name: 'Admin', email: 'admin@jobboard.com', password: 'admin123', role: 'admin' },
  { name: 'TechCorp', email: 'techcorp@jobboard.com', password: 'employer123', role: 'employer' },
  { name: 'Design Studio', email: 'designstudio@jobboard.com', password: 'employer123', role: 'employer' },
  { name: 'John Doe', email: 'john@jobboard.com', password: 'candidate123', role: 'candidate' },
];

const buildJobs = (techId, dsId) => [
  {
    title: 'Senior React Developer',
    company: 'TechCorp',
    location: 'Dhaka',
    type: 'full-time',
    salary: '$3000–5000/mo',
    description:
      'We are looking for an experienced React developer to join our growing product team. You will lead the development of scalable, performant web applications used by thousands of users daily. Collaborating closely with designers and backend engineers, you will own the frontend architecture from planning to deployment. Strong communication and code-review skills are essential.',
    requirements:
      '5+ years of experience with React and modern JavaScript (ES2020+)\nProficiency in TypeScript and state management libraries (Redux, Zustand)\nExperience with testing frameworks such as Jest and React Testing Library\nFamiliarity with CI/CD pipelines and Git workflows\nStrong understanding of web performance optimization techniques',
    employer: techId,
    isActive: true,
  },
  {
    title: 'Node.js Backend Engineer',
    company: 'TechCorp',
    location: 'Remote',
    type: 'remote',
    salary: '$2500–4000/mo',
    description:
      'Join TechCorp as a backend engineer to build and maintain robust REST APIs powering our platform. You will design scalable microservices, optimize database queries, and ensure high availability across all services. This role offers full remote flexibility with async-first communication. Ideal for someone who loves clean code and reliable systems.',
    requirements:
      '3+ years of experience with Node.js and Express\nStrong knowledge of MongoDB and relational databases\nExperience designing RESTful and GraphQL APIs\nFamiliarity with Docker and cloud platforms (AWS or GCP)\nKnowledge of authentication patterns (JWT, OAuth)',
    employer: techId,
    isActive: true,
  },
  {
    title: 'UI/UX Designer',
    company: 'Design Studio',
    location: 'Chittagong',
    type: 'full-time',
    salary: '$1500–2500/mo',
    description:
      'Design Studio is seeking a talented UI/UX Designer to craft intuitive digital experiences for our diverse client base. You will lead the full design lifecycle — from user research and wireframing to high-fidelity prototypes and design handoff. Working closely with developers, you will ensure pixel-perfect implementation of your designs. A strong portfolio demonstrating mobile and web projects is required.',
    requirements:
      'Proficiency in Figma and prototyping tools\n3+ years of experience in UI/UX design for web and mobile\nStrong understanding of user-centered design principles\nAbility to conduct usability testing and translate findings into design improvements\nExperience creating and maintaining design systems',
    employer: dsId,
    isActive: true,
  },
  {
    title: 'Frontend Developer (Vue)',
    company: 'Design Studio',
    location: 'Remote',
    type: 'remote',
    salary: '$2000–3500/mo',
    description:
      'Design Studio is hiring a Vue.js developer to build modern, responsive web applications for our international clients. You will work on a variety of projects ranging from marketing sites to complex SaaS dashboards. The role is fully remote with a collaborative, async-friendly team. You will be expected to write maintainable code and contribute to ongoing design system improvements.',
    requirements:
      '3+ years of experience with Vue.js (v3 preferred)\nStrong HTML, CSS, and JavaScript fundamentals\nExperience with Pinia or Vuex for state management\nFamiliarity with Vite and modern build tooling\nAbility to translate Figma designs into clean, accessible markup',
    employer: dsId,
    isActive: true,
  },
  {
    title: 'MongoDB DBA',
    company: 'TechCorp',
    location: 'Dhaka',
    type: 'contract',
    salary: '$4000/mo',
    description:
      'TechCorp is looking for an experienced MongoDB DBA to manage and optimize our database infrastructure on a contract basis. You will be responsible for performance tuning, replication setup, backup strategies, and query optimization across production clusters. This is a 6-month contract with potential for extension. You will work closely with backend engineers to improve data access patterns.',
    requirements:
      '4+ years of experience with MongoDB in production environments\nStrong understanding of indexing strategies and aggregation pipelines\nExperience with MongoDB Atlas or self-hosted replica sets\nKnowledge of backup and disaster recovery procedures\nFamiliarity with monitoring tools such as MongoDB Ops Manager or Grafana',
    employer: techId,
    isActive: true,
  },
  {
    title: 'React Native Developer',
    company: 'Design Studio',
    location: 'Dhaka',
    type: 'full-time',
    salary: '$2500–4000/mo',
    description:
      'Design Studio is expanding its mobile capabilities and is looking for a React Native developer to build cross-platform apps for iOS and Android. You will work directly with our design team to deliver polished, performant mobile experiences. The role involves integrating REST APIs, managing app state, and publishing updates via CI/CD pipelines. Prior App Store and Play Store publishing experience is a strong plus.',
    requirements:
      '3+ years of React Native development experience\nFamiliarity with Expo and bare workflow builds\nExperience integrating REST APIs and handling offline-first scenarios\nKnowledge of native module bridging (iOS/Android) is a plus\nStrong debugging skills using Flipper and React Native Debugger',
    employer: dsId,
    isActive: true,
  },
  {
    title: 'DevOps Engineer',
    company: 'TechCorp',
    location: 'Remote',
    type: 'remote',
    salary: '$3500–5500/mo',
    description:
      'TechCorp is looking for a DevOps Engineer to automate, scale, and harden our cloud infrastructure. You will own CI/CD pipelines, container orchestration, and infrastructure-as-code across our AWS environment. This is a high-impact role where you will directly influence system reliability and deployment velocity. Strong collaboration with both engineering and security teams is expected.',
    requirements:
      '4+ years of DevOps or platform engineering experience\nHands-on expertise with AWS services (EC2, ECS, RDS, S3, CloudWatch)\nProficiency in Docker and Kubernetes\nExperience writing infrastructure-as-code with Terraform or CloudFormation\nStrong scripting skills in Bash or Python',
    employer: techId,
    isActive: true,
  },
  {
    title: 'Junior Frontend Developer',
    company: 'Design Studio',
    location: 'Dhaka',
    type: 'part-time',
    salary: '$800–1200/mo',
    description:
      'Design Studio is offering a part-time frontend role ideal for a motivated junior developer looking to grow their skills in a real-world environment. You will assist senior developers in building and maintaining client websites, fixing bugs, and implementing new features from design mockups. This role is a great stepping stone for someone transitioning from coursework or bootcamp into professional development. Flexible hours with a 20-hour-per-week commitment.',
    requirements:
      'Solid understanding of HTML, CSS, and vanilla JavaScript\nBasic experience with a JavaScript framework (React or Vue)\nComfort working with Git and collaborative workflows\nEagerness to learn and receive feedback\nFamiliarity with responsive design and cross-browser compatibility',
    employer: dsId,
    isActive: true,
  },
];

const COVER_LETTERS = [
  "I am excited to apply for the Senior React Developer position at TechCorp. With over five years of hands-on React experience, I have built and maintained large-scale frontend applications used by tens of thousands of daily active users. I am confident that my expertise in performance optimization and component architecture would make a strong contribution to your product team. I would love the opportunity to discuss how my background aligns with your needs.",
  "The Node.js Backend Engineer role at TechCorp is an excellent match for my background in building scalable server-side applications. I have three years of production experience with Node.js, Express, and MongoDB, and I am particularly passionate about API design and database performance. The fully remote and async-first culture resonates strongly with how I do my best work. I look forward to contributing to TechCorp's backend infrastructure.",
];

async function seed() {
  try {
    await connectDB();

    // ── Users ────────────────────────────────────────────────────────────────
    let usersCreated = 0;
    const userMap = {};

    for (const def of USERS) {
      let user = await User.findOne({ email: def.email });
      if (user) {
        console.log(`  [skip]    user: ${def.email}`);
      } else {
        user = await User.create(def);
        console.log(`  [created] user: ${def.email}`);
        usersCreated++;
      }
      userMap[def.email] = user;
    }

    const techId = userMap['techcorp@jobboard.com']._id;
    const dsId = userMap['designstudio@jobboard.com']._id;
    const candidate = userMap['john@jobboard.com'];

    // ── Jobs ─────────────────────────────────────────────────────────────────
    let jobsCreated = 0;
    const createdJobs = [];

    for (const def of buildJobs(techId, dsId)) {
      let job = await Job.findOne({ title: def.title, employer: def.employer });
      if (job) {
        console.log(`  [skip]    job: ${def.title}`);
      } else {
        job = await Job.create(def);
        console.log(`  [created] job: ${def.title}`);
        jobsCreated++;
      }
      createdJobs.push(job);
    }

    // ── Applications ─────────────────────────────────────────────────────────
    let appsCreated = 0;

    for (let i = 0; i < 2; i++) {
      const job = createdJobs[i];
      const existing = await Application.findOne({ job: job._id, candidate: candidate._id });
      if (existing) {
        console.log(`  [skip]    application: ${candidate.name} → ${job.title}`);
      } else {
        await Application.create({ job: job._id, candidate: candidate._id, coverLetter: COVER_LETTERS[i] });
        console.log(`  [created] application: ${candidate.name} → ${job.title}`);
        appsCreated++;
      }
    }

    // ── Summary ──────────────────────────────────────────────────────────────
    console.log('\n── Seed complete ───────────────────────────────');
    console.log(`   Users created:        ${usersCreated}`);
    console.log(`   Jobs created:         ${jobsCreated}`);
    console.log(`   Applications created: ${appsCreated}`);
    console.log('────────────────────────────────────────────────');

    process.exit(0);
  } catch (err) {
    console.error('\nSeed failed:', err.message);
    process.exit(1);
  }
}

seed();
