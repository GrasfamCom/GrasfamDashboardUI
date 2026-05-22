const StartQuiz = () => {
  return (
    <div className="relative">
      <h6 className="text-2xl font-semibold text-center">Start Quiz</h6>
      <div className="mt-6 flex flex-col items-center justify-center py-16">
        <div className="text-7xl mb-4">▶️</div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Ready to take a quiz?</h2>
        <p className="text-sm text-gray-500 text-center max-w-sm">
          Select a quiz from the list and start answering questions. Track your progress and improve your score.
        </p>
        <div className="mt-8 px-6 py-3 bg-indigo-600 text-white rounded-lg text-sm font-medium cursor-not-allowed opacity-60">
          Quiz features coming soon
        </div>
      </div>
    </div>
  );
};

export default StartQuiz;
