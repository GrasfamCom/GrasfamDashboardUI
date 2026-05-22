const MyResults = () => {
  return (
    <div className="relative">
      <h6 className="text-2xl font-semibold text-center">My Results</h6>
      <div className="mt-6 flex flex-col items-center justify-center py-16">
        <div className="text-7xl mb-4">📊</div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">My Quiz Results</h2>
        <p className="text-sm text-gray-500 text-center max-w-sm">
          View your personal quiz history, scores, and performance over time.
        </p>
      </div>
    </div>
  );
};

export default MyResults;
