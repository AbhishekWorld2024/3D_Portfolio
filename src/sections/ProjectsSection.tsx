import FadeIn from '../components/FadeIn';

const projects = [
  {
    num: '01',
    name: 'AI-Powered Healthcare Management System',
    stack: ['Python', 'Flask', 'Machine Learning', 'MongoDB', 'REST APIs', 'JWT'],
    highlights: [
      'Engineered full-stack healthcare platform enabling patient registration, appointment scheduling, and doctor management',
      'Built ML models for disease prediction based on user symptoms, improving diagnostic assistance workflows',
      'Developed RESTful backend services using Flask to handle user data, appointments, and real-time interactions',
      'Implemented role-based access (patients, doctors, admin) with secure session handling and data management',
      'Structured for scalability with modular architecture and integration of multiple ML models',
    ],
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80',
  },
  {
    num: '02',
    name: 'Full-Stack E-Commerce Platform',
    stack: ['ReactJS', 'Node.js', 'Express', 'MongoDB', 'JWT', 'REST APIs'],
    highlights: [
      'Developed a full-stack e-commerce system with product catalog, cart, and order management',
      'Built RESTful APIs for authentication, product handling, and order processing',
      'Implemented secure user authentication using JWT and role-based access control',
      'Designed modular backend architecture for scalable and maintainable services',
    ],
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=80',
  },
];

export default function ProjectsSection() {
  return (
    <section
      id="projects"
      className="bg-white rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] -mt-10 sm:-mt-12 md:-mt-14 z-20 relative px-5 sm:px-8 md:px-10 pt-20 sm:pt-24 md:pt-32 pb-24"
    >
      <FadeIn delay={0} y={40}>
        <h2
          className="text-[#0C0C0C] font-black uppercase leading-none tracking-tight text-center mb-16 sm:mb-20 md:mb-28"
          style={{ fontSize: 'clamp(3rem, 12vw, 160px)' }}
        >
          Projects
        </h2>
      </FadeIn>

      <div className="max-w-5xl mx-auto flex flex-col gap-12 sm:gap-16">
        {projects.map((proj, i) => (
          <FadeIn key={proj.num} delay={i * 0.15} y={30}>
            <div className="rounded-[40px] sm:rounded-[50px] border-2 border-[#0C0C0C]/10 bg-[#F7F7F7] overflow-hidden">
              {/* Image */}
              <div className="w-full overflow-hidden" style={{ height: 'clamp(180px, 25vw, 360px)' }}>
                <img
                  src={proj.image}
                  alt={proj.name}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="p-6 sm:p-8 md:p-10">
                {/* Header */}
                <div className="flex items-baseline gap-4 mb-4">
                  <span
                    className="font-black text-[#0C0C0C] leading-none flex-shrink-0"
                    style={{ fontSize: 'clamp(2.5rem, 8vw, 100px)', opacity: 0.12 }}
                  >
                    {proj.num}
                  </span>
                  <h3
                    className="font-black uppercase text-[#0C0C0C] leading-tight"
                    style={{ fontSize: 'clamp(1rem, 2.5vw, 1.8rem)' }}
                  >
                    {proj.name}
                  </h3>
                </div>

                {/* Stack tags */}
                <div className="flex flex-wrap gap-2 mb-5">
                  {proj.stack.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-[#0C0C0C] text-white font-medium uppercase tracking-wide px-3 py-1"
                      style={{ fontSize: 'clamp(0.6rem, 1vw, 0.75rem)' }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Highlights */}
                <ul className="flex flex-col gap-2">
                  {proj.highlights.map((h, j) => (
                    <li key={j} className="flex items-start gap-2 text-[#0C0C0C]"
                      style={{ fontSize: 'clamp(0.8rem, 1.4vw, 1rem)', opacity: 0.7, lineHeight: 1.5 }}>
                      <span className="mt-[3px] text-[#B600A8] flex-shrink-0 font-bold">▸</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
