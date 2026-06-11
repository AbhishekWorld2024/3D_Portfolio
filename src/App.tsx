import './index.css';
import HeroSection from './sections/HeroSection';
import MarqueeSection from './sections/MarqueeSection';
import AboutSection from './sections/AboutSection';
import ServicesSection from './sections/ServicesSection';
import WorkExperienceSection from './sections/WorkExperienceSection';
import ProjectsSection from './sections/ProjectsSection';

export default function App() {
  return (
    <div style={{ background: '#0C0C0C', overflowX: 'clip' }}>
      <HeroSection />
      <MarqueeSection />
      <AboutSection />
      <ServicesSection />
      <WorkExperienceSection />
      <ProjectsSection />
    </div>
  );
}
