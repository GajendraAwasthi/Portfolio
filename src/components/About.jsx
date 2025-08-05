import profile from "../assets/profile.jpg"; // Add your profile image at src/assets/profile.jpg

export default function About() {
  return (
    <div className="min-h-[70vh] flex flex-col sm:flex-row items-center justify-center px-6 py-12 gap-10 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950 rounded-xl mx-auto max-w-5xl shadow-lg mt-12">
      <div className="flex-shrink-0">
        <img
          src={profile}
          alt="Gajendra Awasthi"
          className="w-36 h-36 rounded-3xl object-cover border-4 border-cyan-400 shadow-xl"
        />
      </div>
      <div>
        <h2 className="text-3xl font-bold mb-2 text-cyan-300">About Me</h2>
        <p className="text-lg font-medium mb-6">
          A new learner from Nepal who loves singing, vibing to music, making new friends, and watching podcasts/movies.
        </p>
        <div>
          <h3 className="text-xl font-semibold mb-2 text-cyan-200">Education</h3>
          <ul className="space-y-1">
            <li>
              <span className="font-bold text-cyan-400">BCA</span> - NAST College (<b>2081</b> - Present)
            </li>
            <li>
              <span className="font-bold text-cyan-400">+2 (NEB)</span> - NAST Secondary (2079-2081 B.S), GPA: 2.74
            </li>
            <li>
              <span className="font-bold text-cyan-400">SEE</span> - Mount Saipal (2065–2078 B.S), GPA: 2.50
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}