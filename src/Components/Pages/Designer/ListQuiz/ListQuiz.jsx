const ListQuiz = () => {
  return (
    <div className="relative">
      <h6 className="text-2xl font-semibold text-center">List Quiz</h6>
      <div className="mt-6 flex flex-col items-center justify-center py-16">
        <div className="text-7xl mb-4">📋</div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">All Quizzes</h2>
        <p className="text-sm text-gray-500 text-center max-w-sm">
          Browse, edit, publish, and manage all quizzes you have created.
        </p>
      </div>
    </div>
  );
};

export default ListQuiz;
