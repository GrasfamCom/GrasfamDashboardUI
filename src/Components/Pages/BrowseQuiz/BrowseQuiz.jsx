const BrowseQuiz = () => {
  return (
    <div className="relative">
      <h6 className="text-2xl font-semibold text-center">Browse Quizzes</h6>
      <div className="mt-6 flex flex-col items-center justify-center py-16">
        <div className="text-7xl mb-4">🔍</div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Discover Available Quizzes</h2>
        <p className="text-sm text-gray-500 text-center max-w-sm">
          Browse and search through all available quizzes. Filter by subject, difficulty, or category to find the perfect quiz for you.
        </p>
      </div>
    </div>
  );
};

export default BrowseQuiz;
