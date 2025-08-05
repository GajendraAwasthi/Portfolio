export default function LanguagePanel() {
  return (
    <div className="fixed top-1/2 right-0 -translate-y-1/2 z-40">
      <div className="bg-gray-900/90 rounded-l-2xl px-4 py-5 shadow-2xl flex flex-col items-center gap-4">
        <div className="flex flex-col items-center">
          <span className="text-xl">🇳🇵</span>
          <span className="text-cyan-300 font-bold text-sm">Nepali</span>
          <span className="text-xs text-cyan-100">Fluent</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xl">🇮🇳</span>
          <span className="text-cyan-300 font-bold text-sm">Hindi</span>
          <span className="text-xs text-cyan-100">Fluent</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xl">🇺🇸</span>
          <span className="text-cyan-300 font-bold text-sm">English</span>
          <span className="text-xs text-cyan-100">Intermediate</span>
        </div>
      </div>
    </div>
  );
}