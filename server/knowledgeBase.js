// RAG knowledge base for Abhishek Arugonda's portfolio chatbot.
// Each entry is a semantic "chunk". The server scores these chunks against the
// user's question (keyword / BM25-style scoring) and feeds the top matches to
// the LLM as grounded context. Keep chunks small and self-contained.
//
// Source of truth: Abhishek's Senior AI/ML Engineer resume.

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
    keywords: ['who', 'about', 'summary', 'bio', 'introduction', 'overview', 'background', 'years of experience', 'senior', 'ai engineer', 'ml engineer'],
    text: `Abhishek Arugonda is a Senior AI / ML Engineer with 5+ years of experience productionizing enterprise Generative AI, autonomous multi-agent orchestration, low-latency microservices, and distributed ML pipelines. He is an expert at resolving system bottlenecks — context overflow, state drift, p99 retrieval latency spikes, and hallucinations — across healthcare and banking environments. He specializes in zero-trust AI, hybrid RAG, fine-tuned LLMs, and MLOps infrastructure supporting high-concurrency workloads with 99.9% uptime SLAs. He is based in the USA.`,
  },
  {
    id: 'contact',
    title: 'Contact Information',
    keywords: ['contact', 'email', 'phone', 'reach', 'linkedin', 'github', 'hire', 'connect', 'number'],
    text: `Contact Abhishek Arugonda — Email: abhishek.arugonda567@gmail.com. Phone: +1 (785) 550-2806. LinkedIn: linkedin.com/in/abhishek-arugonda. GitHub: github.com/AbhishekWorld2024. He is open to connecting about Senior AI / ML Engineering opportunities.`,
  },
  {
    id: 'availability',
    title: 'Availability & What He Is Looking For',
    keywords: ['available', 'availability', 'open to work', 'hiring', 'hire', 'new role', 'opportunity', 'opportunities', 'looking for', 'next role', 'relocate', 'relocation', 'location', 'remote', 'hybrid', 'onsite', 'interview'],
    text: `Availability — Abhishek is open to new Senior AI / ML Engineer opportunities focused on Generative AI, multi-agent systems, RAG, LLM fine-tuning, and MLOps. He is based in the USA and is open to relocation as well as remote or hybrid roles. He is happy to schedule interviews or calls — reach him at abhishek.arugonda567@gmail.com.`,
  },

  // -------------------------------------------------------------- EDUCATION
  {
    id: 'education',
    title: 'Education',
    keywords: ['education', 'degree', 'university', 'masters', 'study', 'college', 'school', 'graduated', 'kansas', 'ms', 'computer science'],
    text: `Education — Master of Science in Computer and Information Science, The University of Kansas, USA (Aug 2023 – May 2025).`,
  },

  // ----------------------------------------------------------------- SKILLS
  {
    id: 'skills',
    title: 'Technical Skills',
    keywords: ['skills', 'technologies', 'tech stack', 'languages', 'tools', 'expertise', 'what can you do', 'proficient', 'know', 'langchain', 'langgraph', 'pytorch', 'rag', 'fine-tuning'],
    text: `Technical Skills.
AI Architecture & Agents: Multi-Agent Orchestration, LangChain, LangGraph, Advanced RAG, Fine-Tuning (LoRA, QLoRA, PEFT), Semantic Caching, RAGAS, BERTScore.
Backend & APIs: Python, FastAPI, Asynchronous Streaming, REST APIs, Microservices, OAuth 2.0, JWT, RBAC, Real-Time PII Masking.
Databases & Search: PostgreSQL, Redis, FAISS, Pinecone, Weaviate, Apache Kafka, Hybrid Search, Cross-Encoder Reranking.
ML & Frameworks: PyTorch, TensorFlow, Transformers, BERT, RoBERTa, Sentence-Transformers, NER, Text Classification, Scikit-Learn.
Cloud & MLOps: AWS (SageMaker, Bedrock, Lambda, S3), Azure OpenAI, GCP Vertex AI, Docker, Kubernetes, Terraform, MLflow, Jenkins CI/CD, Databricks, Spark.`,
  },

  // ------------------------------------------------------------- EXPERIENCE
  {
    id: 'exp-cigna',
    title: 'Experience — Cigna Health (Senior AI / ML Engineer)',
    keywords: ['cigna', 'current job', 'currently', 'now', 'present', 'healthcare', 'multi-agent', 'langgraph', 'claude', 'latest', 'where does he work', 'where do you work', 'current role', 'current company', 'employer'],
    text: `Cigna Health — Senior AI / ML Engineer (August 2025 – Present), USA. This is Abhishek's current role.
- Architected an autonomous multi-agent orchestration framework using Python, LangGraph, and Claude 3.5 Sonnet to parse 15+ complex medical benefit structures, eliminating structural hallucinations (error rates dropped from 18% to 7%) while boosting parsing accuracy to 94%.
- Built asynchronous FastAPI microservices backed by PostgreSQL read-replicas and Redis semantic caching, sustaining high-concurrency throughput up to 800 req/min peak load without connection-pool exhaustion.
- Engineered a dual-stage hybrid retrieval topology (sparse keyword search + dense vector retrieval with Pinecone and FAISS + cross-encoder reranking) over 25TB+ of healthcare records — slashing p99 semantic search latency by 60% (from 3.2s to 1.3s) at 92% precision.
- Implemented an active-learning feedback loop using Azure Functions and MLflow, reducing downstream extraction failure rates by 23%.
- Designed a zero-trust streaming ingestion pipeline (Azure Blob Storage, Docker) with real-time PII masking and RBAC, cutting false-positive security alerts by 40%.
- Built automated model-evaluation gates in Jenkins CI/CD with RAGAS and BERTScore, and dynamic token-reduction and model-routing heuristics — a 35% response-consistency gain and 35% lower monthly LLM cost. Deployed containerized ML pipelines on Kubernetes via Terraform IaC at 99.9% uptime with 85%+ test coverage.
Stack: Python, LangGraph, Claude 3.5 Sonnet, FastAPI, PostgreSQL, Redis, Pinecone, FAISS, MLflow, Jenkins, Kubernetes, Terraform.`,
  },
  {
    id: 'exp-usbank',
    title: 'Experience — US Bank (Senior AI / ML Engineer)',
    keywords: ['us bank', 'usbank', 'bank', 'banking', 'finance', 'compliance', 'regulatory', 'gpt-4', 'langchain', 'kafka'],
    text: `US Bank — Senior AI / ML Engineer (June 2024 – May 2025), USA.
- Engineered a multi-model orchestration engine using Python, LangChain, GPT-4, and Claude Sonnet to automate regulatory compliance verification across millions of records, raising classification accuracy to 95%+.
- Constructed a low-latency hybrid RAG topology combining FAISS, Pinecone, and sparse keyword search, dropping average query response latency from 3.2s to 1.3s while elevating retrieval precision under sub-second SLAs.
- Integrated distributed messaging via Apache Kafka and FastAPI microservices to interface core banking data warehouses with streaming AI pipelines.
- Built dual-tier content-safety guardrails using Azure Content Safety APIs and PyTorch classifiers, mitigating false-positive threat alerts by 40% while enforcing zero-trust RBAC.
- Established real-time model telemetry, data-drift tracking, and experiment logging via MLflow and Weights & Biases, maintaining 85%+ test coverage with Pytest.
- Scaled serverless feature-generation pipelines across AWS Lambda, S3, and SageMaker, reducing cloud infrastructure overhead by 30%.
Stack: Python, LangChain, GPT-4, Claude Sonnet, FAISS, Pinecone, Apache Kafka, FastAPI, AWS SageMaker, PyTorch, MLflow.`,
  },
  {
    id: 'exp-ku',
    title: 'Experience — University of Kansas (AI / ML Engineer)',
    keywords: ['university of kansas', 'ku', 'lawrence', 'kansas', 'nlp', 'research papers', 'bm25', 'sentence-transformers'],
    text: `University of Kansas — AI / ML Engineer (December 2023 – June 2024), Lawrence, Kansas.
- Designed high-throughput NLP ingestion pipelines using Python, Pandas, NumPy, and Sentence-Transformers to clean, tokenize, and process 350K+ unstructured research papers, boosting throughput by 55%.
- Engineered a hybrid retrieval engine fusing dense vector representations with BM25 sparse keyword scores, dropping query noise by 42% and elevating retrieval precision from 68% to 87%.
- Developed dynamic context-window compression and chunking routines to eliminate memory-overhead spikes during deep document indexing.
- Architected serverless execution pipelines on AWS Lambda and S3, standardizing containerized testbeds with Docker and Pytest, reducing compute overhead by 30%.
Stack: Python, Sentence-Transformers, BM25, Pandas, NumPy, AWS Lambda, S3, Docker, Pytest.`,
  },
  {
    id: 'exp-cognizant',
    title: 'Experience — Cognizant (Software Engineer / ML Engineer)',
    keywords: ['cognizant', 'india', 'first job', 'earliest', 'bert', 'roberta', 'ner', 'spark', 'databricks', 'kyc'],
    text: `Cognizant — Software Engineer / ML Engineer (July 2021 – July 2023), India.
- Developed custom BERT and RoBERTa Transformer configurations for domain-specific Named Entity Recognition (NER), achieving an 89% F1-score across specialized commercial document-parsing workflows.
- Architected distributed big-data extraction pipelines using Apache Spark and Databricks, processing 1.2TB+ of unstructured data daily for a 3x processing-throughput boost.
- Built high-volume text-classification microservices in Python and FastAPI to evaluate 3M+ financial files (KYC, loans) monthly at a 91% categorization accuracy rate.
- Engineered containerized deployment pipelines using Docker, Jenkins CI/CD, and optimized PostgreSQL indexing, cutting release timelines from 2 days to 4 hours.
Stack: Python, BERT, RoBERTa, Apache Spark, Databricks, FastAPI, Docker, Jenkins, PostgreSQL.`,
  },

  // --------------------------------------------------------------- PROJECTS
  {
    id: 'project-healthguard',
    title: 'Project — HealthGuard AI',
    keywords: ['project', 'healthguard', 'healthcare project', 'compliance', 'monitoring', 'dynamodb', 'sqs', 'rag'],
    text: `Project — HealthGuard AI: Real-Time Healthcare Monitoring & Compliance Platform.
- Developed Java Spring Boot microservices and AI-powered rule engines to monitor healthcare workflows, improving compliance event-detection accuracy and reducing manual review efforts by 30%.
- Architected scalable cloud-native solutions using AWS Lambda, SQS, DynamoDB, and API Gateway, supporting high-volume healthcare transactions with high availability and fault tolerance.
- Developed ReactJS dashboards and implemented LLM-powered knowledge retrieval using RAG techniques, accelerating access to healthcare policies and documentation.
Stack: Java Spring Boot, AWS Lambda, SQS, DynamoDB, API Gateway, ReactJS, RAG.`,
  },
  {
    id: 'project-insightcampus',
    title: 'Project — InsightCampus',
    keywords: ['project', 'insightcampus', 'academic', 'analytics', 'reporting', 'airflow', 'etl', 'rag'],
    text: `Project — InsightCampus: AI-Powered Academic Analytics & Reporting Platform.
- Developed a full-stack academic analytics platform using Java Spring Boot, ReactJS, and PostgreSQL to streamline reporting and provide actionable insights for students, faculty, and administrators.
- Engineered Python and Apache Airflow ETL pipelines to consolidate data from multiple university systems, reducing report-preparation time by over 60% and improving data accuracy.
- Integrated LLM-powered search and RAG-based knowledge retrieval, enabling users to quickly access academic resources, policies, and institutional information through a unified interface.
Stack: Java Spring Boot, ReactJS, PostgreSQL, Python, Apache Airflow, RAG.`,
  },

  // ----------------------------------------------------------- AI ENGINEER
  {
    id: 'ai-engineering',
    title: 'AI / LLM Engineering Focus',
    keywords: ['ai', 'llm', 'rag', 'generative ai', 'genai', 'ai engineer', 'vector', 'agents', 'chatbot', 'fine-tuning', 'mlops'],
    text: `AI / LLM Engineering. Abhishek is a Senior AI / ML Engineer who productionizes enterprise Generative AI: autonomous multi-agent orchestration (LangGraph, Claude, GPT-4), advanced hybrid RAG (dense + sparse retrieval with cross-encoder reranking), LLM fine-tuning (LoRA, QLoRA, PEFT), and custom BERT/RoBERTa transformers for NER and classification. He builds low-latency FastAPI/Spring Boot services with Redis semantic caching and Kafka streaming, and owns the MLOps stack (Docker, Kubernetes, Terraform, MLflow, RAGAS/BERTScore eval gates) at 99.9% uptime. He is expert at taming hallucinations, context overflow, and p99 latency at scale across healthcare and banking.`,
  },
];
