import { sections } from "./data/site.js";
import useActiveSection from "./hooks/useActiveSection.js";
import Sidebar from "./components/Sidebar.jsx";
import MobileNav from "./components/MobileNav.jsx";
import Hero from "./components/Hero.jsx";
import About from "./components/About.jsx";
import Education from "./components/Education.jsx";
import Projects from "./components/Projects.jsx";
import Skills from "./components/Skills.jsx";
import IoT from "./components/IoT.jsx";
import Artwork from "./components/Artwork.jsx";
import Learning from "./components/Learning.jsx";
import Contact from "./components/Contact.jsx";
import Footer from "./components/Footer.jsx";
import CursorGlow from "./components/CursorGlow.jsx";
import ScrollProgress from "./components/ScrollProgress.jsx";

const ids = sections.map((s) => s.id);

export default function App() {
  const active = useActiveSection(ids);

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <ScrollProgress />
      <CursorGlow />
      <MobileNav active={active} />
      <div className="layout">
        <Sidebar active={active} />
        <main id="main" className="content">
          <Hero />
          <About />
          <Education />
          <Projects />
          <Skills />
          <IoT />
          <Artwork />
          <Learning />
          <Contact />
          <Footer />
        </main>
      </div>
    </>
  );
}
