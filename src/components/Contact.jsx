import { FaFacebook, FaInstagram, FaYoutube, FaDownload, FaEnvelope } from "react-icons/fa";

const socials = [
  {
    icon: <FaFacebook size={28} />,
    label: "Facebook",
    link: "https://facebook.com/sanuawasthi123"
  },
  {
    icon: <FaInstagram size={28} />,
    label: "Instagram",
    link: "https://instagram.com/gajendra.awasthi"
  },
  {
    icon: <FaYoutube size={28} />,
    label: "YouTube",
    link: "https://youtube.com/@gajendraawasthimusic"
  }
];

export default function Contact() {
  const handleEmailClick = () => {
    window.open(
      "https://mail.google.com/mail/?view=cm&to=gajendraawasthi456@gmail.com",
      "_blank"
    );
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-14 flex flex-col items-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950 rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-cyan-300">Contact &amp; Socials</h2>
      <div className="flex gap-6 mb-6">
        {socials.map(({ icon, link, label }) => (
          <a
            key={label}
            href={link}
            className="text-cyan-400 hover:text-cyan-200 transition"
            aria-label={label}
            target="_blank"
            rel="noopener noreferrer"
          >
            {icon}
          </a>
        ))}
        <button
          onClick={handleEmailClick}
          className="text-cyan-400 hover:text-cyan-200 transition"
          aria-label="Email"
        >
          <FaEnvelope size={28} />
        </button>
      </div>
      <a
        href="/GajendraAwasthi_CV.pdf"
        download
        className="flex items-center gap-2 text-cyan-300 hover:text-cyan-100 mt-2 underline"
      >
        <FaDownload /> Download CV/Resume
      </a>
    </div>
  );
}