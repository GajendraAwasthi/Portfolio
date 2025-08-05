import { FaRobot, FaBookOpen } from "react-icons/fa";

const projects = [
  {
    icon: <FaRobot size={32} className="text-cyan-400" />,
    name: "GRAB-X-AI Chatbot System",
    desc: "Conversational AI chatbot for smart Q&A and automation.",
    link: "#"
  },
  {
    icon: <FaBookOpen size={32} className="text-cyan-400" />,
    name: "PUCNOTES by NASTEKGAZ",
    desc: "Notes sharing platform for students by NASTEKGAZ.",
    link: "#"
  }
];

export default function Projects() {
  return (
    <div className="py-16 bg-gray-900/95">
      <h2 className="text-3xl font-bold text-center text-cyan-300 mb-10">Projects</h2>
      <div className="flex flex-wrap justify-center gap-8">
        {projects.map((proj) => (
          <div
            key={proj.name}
            className="relative w-72 bg-gray-800 rounded-2xl shadow-2xl p-8 flex flex-col items-center transition-transform hover:-translate-y-2 hover:scale-105 group cursor-pointer"
            tabIndex={0}
          >
            <div className="mb-3">{proj.icon}</div>
            <h3 className="text-xl font-semibold mb-1 group-hover:text-cyan-400">{proj.name}</h3>
            <p className="text-gray-300 text-center text-sm">{proj.desc}</p>
            {proj.link !== "#" && (
              <a
                href={proj.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 underline text-cyan-300 hover:text-cyan-200 text-xs"
              >
                View Project
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}