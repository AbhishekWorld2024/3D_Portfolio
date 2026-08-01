import FadeIn from '../components/FadeIn';

const services = [
  {
    num: '01',
    name: 'Generative AI & RAG',
    desc: 'Designing advanced hybrid RAG systems — dense + sparse retrieval with cross-encoder reranking — that cut p99 latency and eliminate hallucinations over multi-terabyte knowledge bases.',
  },
  {
    num: '02',
    name: 'Multi-Agent Orchestration',
    desc: 'Building autonomous multi-agent frameworks with LangGraph and frontier LLMs (Claude, GPT-4) to automate complex, high-stakes workflows across healthcare and banking.',
  },
  {
    num: '03',
    name: 'LLM Fine-Tuning',
    desc: 'Adapting and fine-tuning LLMs with LoRA, QLoRA, and PEFT, plus custom BERT/RoBERTa transformers for domain-specific NER, classification, and extraction.',
  },
  {
    num: '04',
    name: 'MLOps & Cloud',
    desc: 'Productionizing ML on AWS, Azure, and GCP with Docker, Kubernetes, Terraform, and MLflow — automated eval gates, drift tracking, and 99.9% uptime SLAs.',
  },
  {
    num: '05',
    name: 'Low-Latency Microservices',
    desc: 'Engineering asynchronous FastAPI and Spring Boot services with Redis semantic caching and Kafka streaming to sustain high-concurrency, sub-second workloads.',
  },
];

export default function ServicesSection() {
  return (
    <section
      id="skills"
      className="bg-white rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] px-5 sm:px-8 md:px-10 py-20 sm:py-24 md:py-32"
    >
      <h2
        className="text-[#0C0C0C] font-black uppercase text-center mb-16 sm:mb-20 md:mb-28"
        style={{ fontSize: 'clamp(3rem, 12vw, 160px)', lineHeight: 1 }}
      >
        Expertise
      </h2>

      <div className="max-w-5xl mx-auto">
        {services.map((svc, i) => (
          <FadeIn key={svc.num} delay={i * 0.1} y={20}>
            <div
              className="flex items-start gap-6 md:gap-10 py-8 sm:py-10 md:py-12"
              style={{
                borderTop: i === 0 ? '1px solid rgba(12,12,12,0.15)' : undefined,
                borderBottom: '1px solid rgba(12,12,12,0.15)',
              }}
            >
              <span
                className="font-black text-[#0C0C0C] leading-none flex-shrink-0"
                style={{ fontSize: 'clamp(3rem, 10vw, 140px)' }}
              >
                {svc.num}
              </span>
              <div className="flex flex-col justify-center gap-2 pt-2">
                <p
                  className="font-medium uppercase text-[#0C0C0C]"
                  style={{ fontSize: 'clamp(1rem, 2.2vw, 2.1rem)' }}
                >
                  {svc.name}
                </p>
                <p
                  className="font-light leading-relaxed text-[#0C0C0C] max-w-2xl"
                  style={{ fontSize: 'clamp(0.85rem, 1.6vw, 1.25rem)', opacity: 0.6 }}
                >
                  {svc.desc}
                </p>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
