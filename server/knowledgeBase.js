// RAG knowledge base for Abhishek Arugonda's portfolio chatbot.
// Each entry is a semantic "chunk". The server scores these chunks against the
// user's question (keyword / BM25-style scoring) and feeds the top matches to
// the LLM as grounded context. Keep chunks small and self-contained.

/**
 * @typedef {Object} Chunk
 * @property {string} id
 * @property {string} title
 * @property {string[]} keywords  Extra retrieval hints beyond the body text.
 * @property {string} text        The grounded fact text shown to the LLM.
 */

/** @type {Chunk[]} */
export const knowledgeBase = [
  // ---------------------------------------------------------------- PROFILE
  {
    id: 'profile-summary',
    title: 'Professional Summary',
    keywords: ['who', 'about', 'summary', 'bio', 'introduction', 'overview', 'background', 'years of experience'],
    text: `Abhishek Arugonda is a Software Engineer with 4+ years of experience designing and delivering scalable backend systems, distributed microservices, and cloud-native solutions. He specializes in Java, Spring Boot, and AWS, and is passionate about high-performance systems and integrating cutting-edge AI/LLM solutions. He is based in the Austin, Texas Metropolitan Area.`,
  },
  {
    id: 'contact',
    title: 'Contact Information',
    keywords: ['contact', 'email', 'phone', 'reach', 'linkedin', 'github', 'hire', 'connect', 'number'],
    text: `Contact Abhishek Arugonda — Email: abhishekarugonda3@gmail.com. Phone: +1 (785) 550-2806. LinkedIn: linkedin.com/in/abhishek-arugonda. GitHub: github.com/AbhishekWorld2024. He is open to connecting about software engineering and AI engineering opportunities.`,
  },

  // ------------------------------------------------------------- EXPERIENCE
  {
    id: 'exp-cigna',
    title: 'Experience — The Cigna Group (Software Developer)',
    keywords: ['cigna', 'current job', 'currently', 'now', 'present', 'austin', 'texas', 'healthcare', 'kafka', 'kubernetes', 'microservices', 'latest', 'where does he work', 'where do you work', 'current role', 'current company', 'employer'],
    text: `The Cigna Group — Software Developer (Aug 2025 – Present), Austin, Texas Metropolitan Area. This is Abhishek's current role.
- Engineered high-throughput Java & Spring Boot microservices for healthcare data workflows, reducing API response time by 20% via optimized payload handling, caching & connection pooling.
- Built Kafka-based event-driven pipelines for real-time data streaming, improving workflow reliability by 30% with fault-tolerant message processing and automated retries.
- Containerized & deployed services with Docker & Kubernetes — zero-downtime rolling deployments and 99.9% service availability across production clusters.
- Designed MongoDB schemas achieving sub-100ms read latency; built scalable full-stack features with ReactJS and Redux.
- Architected AWS-based microservices using Lambda, API Gateway & Step Functions for scalable orchestration.
Stack: Java, Spring Boot, Kafka, Docker, Kubernetes, AWS Lambda, MongoDB, ReactJS, Redux.`,
  },
  {
    id: 'exp-ku',
    title: 'Experience — University of Kansas (Software Developer)',
    keywords: ['university of kansas', 'ku', 'lawrence', 'kansas', 'students', 'cloudwatch', 'splunk', 'observability'],
    text: `University of Kansas — Software Developer (Dec 2023 – May 2025), Lawrence, Kansas.
- Delivered full-stack features for the KU web platform used by 10,000+ students & faculty, building ReactJS components integrated with backend services via RESTful APIs.
- Improved MongoDB query performance and data retrieval patterns, increasing backend data access efficiency by 20% and reducing page load times.
- Established observability workflows using AWS CloudWatch & Splunk, cutting incident resolution time by 30% through real-time dashboards and proactive alerting.
Stack: ReactJS, Node.js, REST APIs, MongoDB, AWS CloudWatch, Splunk, TypeScript.`,
  },
  {
    id: 'exp-cognizant',
    title: 'Experience — Cognizant (Software Engineer)',
    keywords: ['cognizant', 'india', 'payment', 'payments', 'iso 20022', 'sepa', 'cbpr', 'rag', 'first job', 'earliest', 'banking', 'finance'],
    text: `Cognizant — Software Engineer (Jul 2021 – Jul 2023), India.
- Led and maintained a high-availability Java-based payment processing backend sustaining 99.95% system uptime for mission-critical enterprise financial workflows.
- Optimized microservices architecture to support CBPR+, ISO 20022 migration & SEPA payment standard integrations with zero-downtime migrations.
- Reduced integration defects by 25% via rigorous API contract validation & cross-system integration quality.
- Built a Retrieval-Augmented Generation (RAG) system using LLM APIs and vector search to enhance data retrieval accuracy by 30%.
Stack: Java, Spring Boot, REST APIs, Microservices, PostgreSQL, RabbitMQ, RAG, LLM APIs.`,
  },

  // --------------------------------------------------------------- PROJECTS
  {
    id: 'project-healthcare',
    title: 'Project — AI-Powered Healthcare Management System',
    keywords: ['project', 'healthcare project', 'machine learning', 'ml', 'flask', 'disease prediction', 'python project'],
    text: `Project 01 — AI-Powered Healthcare Management System.
- Engineered a full-stack healthcare platform enabling patient registration, appointment scheduling, and doctor management.
- Built ML models for disease prediction based on user symptoms, improving diagnostic assistance workflows.
- Developed RESTful backend services using Flask to handle user data, appointments, and real-time interactions.
- Implemented role-based access (patients, doctors, admin) with secure session handling.
- Structured for scalability with modular architecture and integration of multiple ML models.
Stack: Python, Flask, Machine Learning, MongoDB, REST APIs, JWT.`,
  },
  {
    id: 'project-ecommerce',
    title: 'Project — Full-Stack E-Commerce Platform',
    keywords: ['project', 'ecommerce', 'e-commerce', 'shopping', 'cart', 'node', 'react project', 'mern'],
    text: `Project 02 — Full-Stack E-Commerce Platform.
- Developed a full-stack e-commerce system with product catalog, cart, and order management.
- Built RESTful APIs for authentication, product handling, and order processing.
- Implemented secure user authentication using JWT and role-based access control.
- Designed a modular backend architecture for scalable and maintainable services.
Stack: ReactJS, Node.js, Express, MongoDB, JWT, REST APIs.`,
  },

  // ----------------------------------------------------------------- SKILLS
  {
    id: 'skills',
    title: 'Technical Skills',
    keywords: ['skills', 'technologies', 'tech stack', 'languages', 'tools', 'expertise', 'what can you do', 'proficient', 'know'],
    text: `Technical Skills.
Languages: Java, Python, JavaScript, TypeScript, SQL.
Backend & Frameworks: Spring Boot, Node.js, Express, Flask, REST APIs, Microservices.
Frontend: ReactJS, Redux, HTML, CSS, Tailwind CSS.
Cloud & DevOps: AWS (Lambda, API Gateway, Step Functions, CloudWatch), Docker, Kubernetes.
Messaging & Streaming: Apache Kafka, RabbitMQ.
Databases: MongoDB, PostgreSQL.
AI / ML: Machine Learning, LLM APIs, Retrieval-Augmented Generation (RAG), vector search.
Observability: AWS CloudWatch, Splunk.`,
  },

  // -------------------------------------------------------------- EDUCATION
  {
    id: 'education',
    title: 'Education',
    keywords: ['education', 'degree', 'university', 'masters', 'study', 'college', 'school', 'graduated'],
    text: `Education — Abhishek pursued graduate study in the United States (University of Kansas, Lawrence, Kansas) and has a strong foundation in computer science and software engineering, complemented by industry certifications.`,
  },

  // -------------------------------------------------------- CERTIFICATIONS
  {
    id: 'certifications',
    title: 'Certifications',
    keywords: ['certification', 'certifications', 'certificate', 'aws certified', 'databricks', 'claude code', 'genai', 'credentials'],
    text: `Certifications.
- AWS Certified Solutions Architect – Associate.
- Databricks Generative AI Fundamentals.
- Claude Code in Action (Anthropic).
- AWS Generative AI: The Art of the Possible.
These reflect Abhishek's focus on cloud architecture and generative AI / LLM engineering.`,
  },

  // ----------------------------------------------------------- AI ENGINEER
  {
    id: 'ai-engineering',
    title: 'AI / LLM Engineering Focus',
    keywords: ['ai', 'llm', 'rag', 'generative ai', 'genai', 'ai engineer', 'vector', 'anthropic', 'chatbot'],
    text: `AI / AI Engineering. Abhishek combines software engineering with AI engineering. He has built a production Retrieval-Augmented Generation (RAG) system using LLM APIs and vector search (at Cognizant), holds Databricks GenAI and AWS Generative AI certifications, and built this very portfolio chatbot using a RAG + LLM architecture. He is comfortable designing LLM-backed features, prompt engineering, and grounding model outputs in trusted data.`,
  },

  // ----------------------------------------------------- WEEKLY SCHEDULE
  {
    id: 'schedule-overview',
    title: 'Weekly Schedule — Overview',
    keywords: ['schedule', 'routine', 'weekly', 'availability', 'free time', 'daily routine', 'typical week', 'lifestyle', 'when are you free', 'available'],
    text: `Abhishek's weekly routine balances fitness, focused work, learning, and social life. Mornings usually start between 6:30–8:30 AM (gym, run, or yoga), core work happens late morning through afternoon with a stand-up call around 9:00 AM, and evenings mix hobbies, friends/family, and rest. He works on a hybrid/office schedule (daily stand-up calls) and protects time for personal projects and certification study. General availability for work is during standard daytime hours on weekdays.`,
  },
  {
    id: 'schedule-monday',
    title: 'Schedule — Monday (Gym + Work + Friends Night)',
    keywords: ['monday', 'gym', 'friends', 'cooking'],
    text: `Monday — Gym + Work + Friends Night.
7:00 AM Wake up. 7:30 AM Gym (until 8:30 AM). 9:00 AM Stand-up call (office) until 10:00 AM. 10:00 AM Start work (until 12:00 noon). 12:00 PM Cooking (until 1:00 PM). 1:00 PM Resume work (until 3:00 PM). 3:00 PM Sleep/nap (2 hours). 5:00 PM Go out with friends, dinner outside. 10:00 PM Reach home. 11:00 PM Sleep.`,
  },
  {
    id: 'schedule-tuesday',
    title: 'Schedule — Tuesday (Run + Deep Work + Errands)',
    keywords: ['tuesday', 'run', 'running', 'deep work', 'errands', 'focus'],
    text: `Tuesday — Run + Deep Work + Errands + Home Evening.
6:30 AM Wake up, morning run (30 min). 7:30 AM Shower, breakfast at home. 9:00 AM Stand-up call (office). 9:30 AM Deep work / focus blocks (no meetings). 12:30 PM Order lunch, eat at desk. 1:30 PM Continue work (until 4:00 PM). 4:00 PM Errands: bank, pharmacy, or grocery. 6:00 PM Home, read or podcast. 7:30 PM Cook dinner at home. 9:00 PM Movie or series. 10:30 PM Sleep.`,
  },
  {
    id: 'schedule-wednesday',
    title: 'Schedule — Wednesday (Yoga + Meetings + Hobby)',
    keywords: ['wednesday', 'yoga', 'meetings', 'team lunch', 'hobby', 'certification study'],
    text: `Wednesday — Yoga + Meetings + Team Lunch + Hobby.
7:30 AM Wake up (no gym today). 8:00 AM Yoga or stretch at home (30 min). 9:00 AM Stand-up call. 9:30 AM Meetings and calls (until 12:00 noon). 12:00 PM Team lunch outside (1 hour). 1:00 PM Work (until 4:00 PM). 4:00 PM Online course or certification study. 6:00 PM Snack, short walk. 7:00 PM Hobby time (gaming / music / coding side project). 9:00 PM Light dinner at home. 11:00 PM Sleep.`,
  },
  {
    id: 'schedule-thursday',
    title: 'Schedule — Thursday (Gym Strength + Sports)',
    keywords: ['thursday', 'gym', 'strength', 'sports', 'badminton', 'cricket', 'football', 'nap'],
    text: `Thursday — Gym Strength + Sports + Dinner Out.
7:00 AM Wake up. 7:45 AM Gym (until 8:45 AM) – strength day. 9:00 AM Stand-up call. 10:00 AM Work (until 1:00 PM). 1:00 PM Quick lunch, then work (until 3:00 PM). 3:00 PM Nap (1.5 hours). 4:30 PM Sports: badminton / cricket / football with friends. 7:00 PM Dinner with friends (outside). 9:30 PM Home. 11:00 PM Sleep.`,
  },
  {
    id: 'schedule-friday',
    title: 'Schedule — Friday (Gym + Early Logoff + Night Out)',
    keywords: ['friday', 'gym', 'early logoff', 'party', 'night out', 'weekend start'],
    text: `Friday — Gym + Early Logoff + Late Night Out.
7:00 AM Wake up. 7:30 AM Gym (until 8:30 AM). 9:00 AM Stand-up call. 10:00 AM Work – wrap up week, clear backlog. 12:00 PM Lunch with colleagues (outside). 1:00 PM Work until 3:00 PM, then log off early. 3:30 PM Relax at home, nap or series. 6:00 PM Get ready, plan for evening. 7:30 PM Dinner with friends or party / hangout. 11:00 PM Home (later than other days). 12:00 AM Sleep.`,
  },
  {
    id: 'schedule-saturday',
    title: 'Schedule — Saturday (Chores + Outing + Project)',
    keywords: ['saturday', 'chores', 'laundry', 'outing', 'mall', 'drive', 'personal project', 'weekend'],
    text: `Saturday — Chores + Outing + Personal Project + Dinner Out.
8:00 AM Wake up (no alarm). 8:30 AM Breakfast, coffee, slow start. 10:00 AM Chores: laundry, cleaning, room tidy. 12:00 PM Lunch at home. 1:00 PM Out: market, mall, or long drive. 5:00 PM Back home or continue outing. 6:30 PM Personal project or hobby (2 hours). 8:30 PM Dinner outside with friends or family. 10:30 PM Home. 11:30 PM Sleep.`,
  },
  {
    id: 'schedule-sunday',
    title: 'Schedule — Sunday (Rest + Family + Meal Prep)',
    keywords: ['sunday', 'rest', 'family call', 'meal prep', 'planning', 'grocery', 'weekend', 'early sleep'],
    text: `Sunday — Rest + Family Call + Meal Prep + Early Sleep.
8:30 AM Wake up. 9:00 AM Heavy breakfast / brunch at home. 10:00 AM Grocery shopping, weekly planning. 12:00 PM Lunch at home. 1:00 PM Rest: movie, series, or nap (2–3 hours). 4:00 PM Video call with family (parents / siblings). 5:30 PM Meal prep for Monday (lunch or snacks). 7:00 PM Light dinner at home. 8:00 PM Wind down, set alarm, plan Monday. 10:00 PM Early sleep (rest for the week ahead).`,
  },
];
