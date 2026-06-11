import FadeIn from '../components/FadeIn';
import Magnet from '../components/Magnet';
import ChatButton from '../components/ChatButton';

const navLinks = ['About', 'Skills', 'Experience', 'Projects'];

export default function HeroSection() {
  return (
    <section
      className="h-screen flex flex-col relative"
      style={{ overflowX: 'clip' }}
    >
      {/* Navbar */}
      <FadeIn delay={0} y={-20}>
        <nav className="flex justify-between items-center px-6 md:px-10 pt-6 md:pt-8">
          {navLinks.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className="text-[#D7E2EA] font-medium uppercase tracking-wider text-sm md:text-lg lg:text-[1.4rem] hover:opacity-70 transition-opacity duration-200"
            >
              {link}
            </a>
          ))}
        </nav>
      </FadeIn>

      {/* Hero Heading */}
      <div className="overflow-hidden">
        <FadeIn delay={0.15} y={40}>
          <h1 className="hero-heading font-black uppercase tracking-tight leading-none whitespace-nowrap w-full text-center text-[10vw] sm:text-[11vw] md:text-[12vw] lg:text-[13vw] mt-6 sm:mt-4 md:-mt-5">
            Hi, i&apos;m abhishek
          </h1>
        </FadeIn>
      </div>

      {/* Bottom Bar */}
      <div className="flex justify-between items-end mt-auto px-6 md:px-10 pb-7 sm:pb-8 md:pb-10">
        <FadeIn delay={0.35} y={20}>
          <p
            className="text-[#D7E2EA] font-light uppercase tracking-wide leading-snug max-w-[160px] sm:max-w-[220px] md:max-w-[260px]"
            style={{ fontSize: 'clamp(0.75rem, 1.4vw, 1.5rem)' }}
          >
            a software engineer crafting scalable systems and digital experiences
          </p>
        </FadeIn>

        <FadeIn delay={0.5} y={20}>
          <ChatButton />
        </FadeIn>
      </div>

      {/* Portrait */}
      <FadeIn
        delay={0.6}
        y={30}
        className="absolute left-1/2 -translate-x-1/2 z-10 top-1/2 -translate-y-1/2 sm:top-auto sm:translate-y-0 sm:bottom-0 w-[280px] sm:w-[360px] md:w-[440px] lg:w-[520px]"
      >
        <Magnet padding={150} strength={3} activeTransition="transform 0.3s ease-out" inactiveTransition="transform 0.6s ease-in-out">
          <img
            src="https://shrug-person-78902957.figma.site/_components/v2/d24c01ad3a56fc65e942a1f501eb73db42d7cf9a/Rectangle_40443.81459862.png"
            alt="Abhishek portrait"
            className="w-full h-auto"
            draggable={false}
          />
        </Magnet>
      </FadeIn>
    </section>
  );
}
