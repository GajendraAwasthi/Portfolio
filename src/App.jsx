import { useRef } from "react";
import Hero3D from "./components/Hero3D";
import About from "./components/About";
import Experience from "./components/Experience";
import SkillsCloud from "./components/SkillsCloud";
import Projects from "./components/Projects";
import Contact from "./components/Contact";
import LanguagePanel from "./components/LanguagePanel";
import Navbar from "./components/Navbar";

function App() {
  // Section refs for scroll nav
  const aboutRef = useRef(null);
  const expRef = useRef(null);
  const skillsRef = useRef(null);
  const projRef = useRef(null);
  const contactRef = useRef(null);

  return (
    <div className="relative overflow-x-hidden">
      <Navbar refs={{ aboutRef, expRef, skillsRef, projRef, contactRef }} />
      <section>
        <Hero3D scrollToRef={aboutRef} />
      </section>
      <section ref={aboutRef}>
        <About />
      </section>
      <section ref={expRef}>
        <Experience />
      </section>
      <section ref={skillsRef}>
        <SkillsCloud />
      </section>
      <section ref={projRef}>
        <Projects />
      </section>
      <section ref={contactRef} className="pb-16">
        <Contact />
      </section>
      <LanguagePanel />
    </div>
  );
}
export default App;