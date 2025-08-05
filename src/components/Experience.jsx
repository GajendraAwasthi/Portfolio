import { FaPaintBrush } from "react-icons/fa";
import { MdWork } from "react-icons/md";

export default function Experience() {
  return (
    <div className="py-16 bg-gray-900/90">
      <h2 className="text-3xl font-bold text-center text-cyan-300 mb-10">Experience</h2>
      <div className="flex flex-col md:flex-row items-center justify-center gap-10">
        <div className="bg-gray-800 rounded-xl shadow-xl p-6 w-72 flex flex-col items-center hover:scale-105 transition">
          <FaPaintBrush size={36} className="text-cyan-400 mb-2" />
          <h3 className="text-xl font-semibold">Freelance Graphics Designer</h3>
          <p className="text-cyan-300">2022 - Present</p>
          <p className="mt-2 text-sm text-gray-300 text-center">
            Designing logos, posters, and creatives for various clients and brands.
          </p>
        </div>
        <div className="bg-gray-800 rounded-xl shadow-xl p-6 w-72 flex flex-col items-center hover:scale-105 transition">
          <MdWork size={36} className="text-cyan-400 mb-2" />
          <h3 className="text-xl font-semibold">Executive Graphic Designer @ ITAN</h3>
          <p className="text-cyan-300">Feb - Apr 2024</p>
          <p className="mt-2 text-sm text-gray-300 text-center">
            Led creative design for events and digital campaigns at ITAN.
          </p>
        </div>
      </div>
    </div>
  );
}