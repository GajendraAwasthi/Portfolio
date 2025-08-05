import { FaUser, FaBriefcase, FaTools, FaProjectDiagram, FaEnvelope } from "react-icons/fa";

const navLinks = [
  { label: "About", icon: <FaUser />, target: "aboutRef" },
  { label: "Experience", icon: <FaBriefcase />, target: "expRef" },
  { label: "Skills", icon: <FaTools />, target: "skillsRef" },
  { label: "Projects", icon: <FaProjectDiagram />, target: "projRef" },
  { label: "Contact", icon: <FaEnvelope />, target: "contactRef" },
];

export default function Navbar({ refs }) {
  const scrollToSection = (ref) => {
    refs[ref]?.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="fixed top-6 left-1/2 z-50 -translate-x-1/2 bg-gray-900/80 rounded-full shadow-lg px-4 py-2 flex gap-2">
      {navLinks.map(({ label, icon, target }) => (
        <button
          key={label}
          onClick={() => scrollToSection(target)}
          className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold hover:bg-gray-700 transition"
          aria-label={label}
        >
          {icon}
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </nav>
  );
}