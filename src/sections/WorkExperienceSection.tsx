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
    company: 'The Cigna Group',
    role: 'Software Developer',
    period: 'Aug 2025 – Present',
    location: 'Austin, Texas Metropolitan Area',
    highlights: [
      'Engineered high-throughput Java & Spring Boot microservices for healthcare data workflows, reducing API response time by 20% via optimized payload handling, caching & connection pooling',
      'Built Kafka-based event-driven pipelines for real-time data streaming, improving workflow reliability by 30% with fault-tolerant message processing and automated retries',
      'Containerized & deployed services with Docker & Kubernetes — zero-downtime rolling deployments and 99.9% service availability across production clusters',
      'Designed MongoDB schemas achieving sub-100ms read latency; built scalable full-stack features with ReactJS and Redux frontend',
      'Architected AWS-based microservices using Lambda, API Gateway & Step Functions for scalable orchestration',
    ],
    stack: ['Java', 'Spring Boot', 'Kafka', 'Docker', 'Kubernetes', 'AWS Lambda', 'MongoDB', 'ReactJS', 'Redux'],
    images: {
      col1top: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
      col1bot: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=800&q=80',
      col2:    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
    },
  },
  {
    num: '02',
    company: 'University of Kansas',
    role: 'Software Developer',
    period: 'Dec 2023 – May 2025',
    location: 'Lawrence, Kansas',
    highlights: [
      'Delivered full-stack features for the KU web platform used by 10,000+ students & faculty, building ReactJS components integrated with backend services via RESTful APIs',
      'Improved MongoDB query performance and data retrieval patterns, increasing backend data access efficiency by 20% and reducing page load times',
      'Established observability workflows using AWS CloudWatch & Splunk, cutting incident resolution time by 30% through real-time dashboards and proactive alerting',
    ],
    stack: ['ReactJS', 'Node.js', 'REST APIs', 'MongoDB', 'AWS CloudWatch', 'Splunk', 'TypeScript'],
    images: {
      col1top: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80',
      col1bot: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
      col2:    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
    },
  },
  {
    num: '03',
    company: 'Cognizant',
    role: 'Software Engineer',
    period: 'Jul 2021 – Jul 2023',
    location: 'India',
    highlights: [
      'Led and maintained a high-availability Java-based payment processing backend sustaining 99.95% system uptime for mission-critical enterprise financial workflows',
      'Optimized microservices architecture to support CBPR+, ISO 20022 migration & SEPA payment standard integrations with zero-downtime migrations',
      'Reduced integration defects by 25% via rigorous API contract validation & cross-system integration quality',
      'Built a Retrieval-Augmented Generation (RAG) system using LLM APIs and vector search to enhance data retrieval accuracy by 30%',
    ],
    stack: ['Java', 'Spring Boot', 'REST APIs', 'Microservices', 'PostgreSQL', 'RabbitMQ', 'RAG', 'LLM APIs'],
    images: {
      col1top: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
      col1bot: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
      col2:    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
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
