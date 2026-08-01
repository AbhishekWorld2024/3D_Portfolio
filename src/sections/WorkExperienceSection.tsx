import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import FadeIn from '../components/FadeIn';

interface Experience {
  num: string;
  company: string;
  role: string;
  period: string;
  location: string;
  highlights: string[];
  stack: string[];
  images: { col1top: string; col1bot: string; col2: string };
}

const experiences: Experience[] = [
  {
    num: '01',
    company: 'Cigna Health',
    role: 'Senior AI / ML Engineer',
    period: 'Aug 2025 – Present',
    location: 'USA',
    highlights: [
      'Architected an autonomous multi-agent orchestration framework (Python, LangGraph, Claude 3.5 Sonnet) parsing 15+ complex medical benefit structures — cut error rates from 18% to 7% and lifted parsing accuracy to 94%',
      'Built asynchronous FastAPI microservices with PostgreSQL read-replicas and Redis semantic caching, sustaining 800 req/min peak load without connection-pool exhaustion',
      'Engineered a dual-stage hybrid retrieval topology (sparse + dense Pinecone/FAISS + cross-encoder reranking) over 25TB+ of records — slashed p99 search latency 60% (3.2s → 1.3s) at 92% precision',
      'Implemented an active-learning feedback loop (Azure Functions + MLflow) that reduced downstream extraction failures by 23%',
      'Added model-eval gates in Jenkins CI/CD (RAGAS, BERTScore) and intelligent model routing — 35% response-consistency gain and 35% lower monthly LLM cost, on Kubernetes with 99.9% uptime SLAs',
    ],
    stack: ['Python', 'LangGraph', 'Claude 3.5', 'FastAPI', 'PostgreSQL', 'Redis', 'Pinecone', 'FAISS', 'MLflow', 'Kubernetes', 'Terraform'],
    images: {
      col1top: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
      col1bot: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=800&q=80',
      col2:    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
    },
  },
  {
    num: '02',
    company: 'US Bank',
    role: 'Senior AI / ML Engineer',
    period: 'Jun 2024 – May 2025',
    location: 'USA',
    highlights: [
      'Engineered a multi-model orchestration engine (Python, LangChain, GPT-4, Claude Sonnet) automating regulatory compliance verification across millions of records at 95%+ accuracy',
      'Constructed a low-latency hybrid RAG topology (FAISS, Pinecone, sparse keyword search) dropping query latency from 3.2s to 1.3s while raising retrieval precision',
      'Integrated Apache Kafka + FastAPI streaming pipelines interfacing core banking data warehouses under sub-second SLAs',
      'Built dual-tier content-safety guardrails (Azure Content Safety + PyTorch classifiers) cutting false-positive threat alerts 40% with zero-trust RBAC',
      'Scaled serverless feature pipelines (AWS Lambda, S3, SageMaker), reducing cloud overhead 30% while maintaining 85%+ test coverage',
    ],
    stack: ['Python', 'LangChain', 'GPT-4', 'Claude', 'FAISS', 'Pinecone', 'Kafka', 'FastAPI', 'AWS SageMaker', 'PyTorch', 'MLflow'],
    images: {
      col1top: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
      col1bot: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
      col2:    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    },
  },
  {
    num: '03',
    company: 'University of Kansas',
    role: 'AI / ML Engineer',
    period: 'Dec 2023 – Jun 2024',
    location: 'Lawrence, Kansas',
    highlights: [
      'Designed high-throughput NLP ingestion pipelines (Python, Pandas, NumPy, Sentence-Transformers) processing 350K+ research papers, boosting throughput by 55%',
      'Engineered a hybrid retrieval engine fusing dense vectors with BM25 sparse scores — cut query noise 42% and lifted precision from 68% to 87%',
      'Developed dynamic context-window compression and chunking routines that eliminated memory-overhead spikes during deep document indexing',
      'Architected serverless AWS Lambda/S3 pipelines with Dockerized Pytest testbeds, reducing compute overhead by 30%',
    ],
    stack: ['Python', 'Sentence-Transformers', 'BM25', 'Pandas', 'NumPy', 'AWS Lambda', 'S3', 'Docker', 'Pytest'],
    images: {
      col1top: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80',
      col1bot: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
      col2:    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
    },
  },
  {
    num: '04',
    company: 'Cognizant',
    role: 'Software Engineer / ML Engineer',
    period: 'Jul 2021 – Jul 2023',
    location: 'India',
    highlights: [
      'Developed custom BERT & RoBERTa configurations for domain-specific Named Entity Recognition, achieving 89% F1 across commercial document-parsing workflows',
      'Architected distributed big-data extraction with Apache Spark & Databricks, processing 1.2TB+ daily for a 3x throughput boost',
      'Built high-volume text-classification microservices (Python, FastAPI) evaluating 3M+ financial files (KYC, loans) monthly at 91% accuracy',
      'Engineered Docker + Jenkins CI/CD pipelines and optimized PostgreSQL indexing, cutting release timelines from 2 days to 4 hours',
    ],
    stack: ['Python', 'BERT', 'RoBERTa', 'Apache Spark', 'Databricks', 'FastAPI', 'Docker', 'Jenkins', 'PostgreSQL'],
    images: {
      col1top: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
      col1bot: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
      col2:    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
    },
  },
];

const totalCards = experiences.length;

function ExperienceCard({ exp, index }: { exp: Experience; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: cardRef, offset: ['start end', 'end start'] });
  const targetScale = 1 - (totalCards - 1 - index) * 0.03;
  const scale = useTransform(scrollYProgress, [0, 1], [1, targetScale]);

  return (
    <div ref={cardRef} className="h-[85vh] flex items-start justify-center" style={{ paddingTop: `${index * 28}px` }}>
      <motion.div
        style={{ scale, top: `${96 + index * 28}px`, willChange: 'transform' }}
        className="sticky rounded-[40px] sm:rounded-[50px] md:rounded-[60px] border-2 border-[#D7E2EA] bg-[#0C0C0C] p-4 sm:p-6 md:p-8 w-full"
      >
        {/* Top row */}
        <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-baseline gap-4 sm:gap-5">
            <span
              className="hero-heading font-black leading-none"
              style={{ fontSize: 'clamp(2.5rem, 8vw, 100px)' }}
            >
              {exp.num}
            </span>
            <div className="flex flex-col gap-0.5">
              <span
                className="text-[#D7E2EA] font-black uppercase tracking-wide"
                style={{ fontSize: 'clamp(0.9rem, 2vw, 1.6rem)' }}
              >
                {exp.company}
              </span>
              <span
                className="text-[#D7E2EA] uppercase tracking-wider font-light opacity-60"
                style={{ fontSize: 'clamp(0.65rem, 1.1vw, 0.9rem)' }}
              >
                {exp.role} &nbsp;·&nbsp; {exp.period} &nbsp;·&nbsp; {exp.location}
              </span>
            </div>
          </div>
        </div>

        {/* Highlights */}
        <ul className="mb-3 flex flex-col gap-1">
          {exp.highlights.map((h, i) => (
            <li key={i} className="flex items-start gap-2 text-[#D7E2EA]"
              style={{ fontSize: 'clamp(0.65rem, 1vw, 0.85rem)', opacity: 0.75, lineHeight: 1.4 }}>
              <span className="mt-[2px] text-[#B600A8] flex-shrink-0">▸</span>
              <span>{h}</span>
            </li>
          ))}
        </ul>

        {/* Stack tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {exp.stack.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-[#D7E2EA]/30 text-[#D7E2EA] font-medium uppercase tracking-wide px-2.5 py-0.5"
              style={{ fontSize: 'clamp(0.5rem, 0.85vw, 0.7rem)', opacity: 0.8 }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Image grid */}
        <div className="flex gap-3 sm:gap-4">
          <div className="flex flex-col gap-3 sm:gap-4" style={{ width: '40%' }}>
            <img src={exp.images.col1top} alt={exp.company} loading="lazy"
              className="w-full object-cover rounded-[30px] sm:rounded-[40px]"
              style={{ height: 'clamp(90px, 11vw, 160px)' }} />
            <img src={exp.images.col1bot} alt={exp.company} loading="lazy"
              className="w-full object-cover rounded-[30px] sm:rounded-[40px]"
              style={{ height: 'clamp(110px, 14vw, 220px)' }} />
          </div>
          <div style={{ width: '60%' }}>
            <img src={exp.images.col2} alt={exp.company} loading="lazy"
              className="w-full object-cover rounded-[30px] sm:rounded-[40px]"
              style={{ height: 'calc(clamp(90px, 11vw, 160px) + clamp(110px, 14vw, 220px) + 12px)' }} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function WorkExperienceSection() {
  return (
    <section
      id="experience"
      className="bg-[#0C0C0C] rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] -mt-10 sm:-mt-12 md:-mt-14 z-10 relative px-5 sm:px-8 md:px-10 pt-20 sm:pt-24 md:pt-32 pb-24"
    >
      <FadeIn delay={0} y={40}>
        <h2
          className="hero-heading font-black uppercase leading-none tracking-tight text-center mb-16 sm:mb-20 md:mb-28"
          style={{ fontSize: 'clamp(2rem, 9vw, 130px)' }}
        >
          Work Experience
        </h2>
      </FadeIn>

      <div className="flex flex-col">
        {experiences.map((exp, i) => (
          <ExperienceCard key={exp.num} exp={exp} index={i} />
        ))}
      </div>
    </section>
  );
}
