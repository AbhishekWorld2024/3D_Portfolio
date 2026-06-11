import FadeIn from '../components/FadeIn';

const services = [
  {
    num: '01',
    name: 'Backend Development',
    desc: 'Building scalable backend systems and microservices with Java and Spring Boot, delivering 99.9% availability in high-traffic enterprise environments.',
  },
  {
    num: '02',
    name: 'Cloud & DevOps',
    desc: 'Architecting cloud-native solutions on AWS with Docker, Kubernetes, and CI/CD pipelines — enabling seamless deployment, observability, and infrastructure automation.',
  },
  {
    num: '03',
    name: 'Full Stack',
    desc: 'Crafting end-to-end web applications with ReactJS, Node.js, and REST APIs, from intuitive frontends to robust backend services.',
  },
  {
    num: '04',
    name: 'System Design',
    desc: 'Designing distributed systems and microservices architectures that scale horizontally, handling millions of transactions with resilience and reliability.',
  },
  {
    num: '05',
    name: 'AI Integration',
    desc: 'Integrating Generative AI and LLM APIs to build intelligent, context-aware features that elevate product capabilities and automate complex workflows.',
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
