import { useRef, useEffect } from "react";
import gsap from "gsap";

const skills = [
  "C", "HTML5", "CSS3", "JavaScript", "MySQL",
  "Photoshop", "Illustrator", "Canva", "CorelDRAW",
  "Teamwork", "Communication", "Self-Motivated", "Passionate Learner"
];

export default function SkillsCloud() {
  const sphereRef = useRef();

  useEffect(() => {
    // Simulate basic 3D sphere rotation using GSAP
    let angle = 0;
    const rotate = () => {
      angle += 0.01;
      if (sphereRef.current) {
        sphereRef.current.style.transform = `rotateY(${angle}rad)`;
      }
      requestAnimationFrame(rotate);
    };
    rotate();
  }, []);

  return (
    <div className="py-16 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800">
      <h2 className="text-3xl font-bold text-center text-cyan-300 mb-10">
        Skills &amp; Tools
      </h2>
      <div className="flex justify-center">
        <div
          ref={sphereRef}
          className="relative w-64 h-64 flex items-center justify-center"
          style={{ perspective: 600 }}
        >
          {skills.map((skill, i) => {
            const phi = Math.acos(-1 + (2 * i) / skills.length);
            const theta = Math.sqrt(skills.length * Math.PI) * phi;
            // 3D sphere coordinate math
            const x = 90 * Math.cos(theta) * Math.sin(phi);
            const y = 90 * Math.sin(theta) * Math.sin(phi);
            const z = 90 * Math.cos(phi);
            return (
              <span
                key={skill}
                className="absolute px-3 py-1 rounded-full font-medium text-sm text-cyan-100 bg-cyan-800/80 shadow-lg hover:bg-cyan-400 hover:text-gray-900 transition"
                style={{
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                  transform: `translate(-50%, -50%) scale(${1 + z / 300})`,
                  zIndex: Math.round(100 + z),
                  opacity: 0.95 + z / 250,
                  pointerEvents: "auto"
                }}
              >
                {skill}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}