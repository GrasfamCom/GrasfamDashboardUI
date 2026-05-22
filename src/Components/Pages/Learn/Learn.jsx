const Learn = () => {
  const subjects = [
    { icon: "➗", label: "Mathematics", path: "/Quiz/Learn/Mathematics", desc: "Numbers, algebra, and problem solving" },
    { icon: "⚛️", label: "Physics", path: "/Quiz/Learn/Physics", desc: "Laws of nature and the universe" },
    { icon: "🧬", label: "Biology", path: "/Quiz/Learn/Biology", desc: "Life sciences and living organisms" },
    { icon: "🔤", label: "English", path: "/Quiz/Learn/English", desc: "Language skills and communication" },
  ];

  return (
    <div className="relative">
      <h6 className="text-2xl font-semibold text-center">Learn</h6>
      <p className="text-sm text-gray-500 text-center mt-1 mb-6">
        Choose a subject to start learning
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {subjects.map((subject) => (
          <div
            key={subject.label}
            className="flex items-start gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-sm transition-all cursor-pointer"
          >
            <div className="text-3xl">{subject.icon}</div>
            <div>
              <h3 className="font-semibold text-gray-800">{subject.label}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{subject.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Learn;
