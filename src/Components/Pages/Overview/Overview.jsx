const Overview = () => {
  return (
    <div className="relative">
      <h6 className="text-2xl font-semibold text-center">Dashboard Overview</h6>
      <div className="mt-6 flex flex-col items-center justify-center py-16">
        <div className="text-7xl mb-4">📊</div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Welcome to your Dashboard</h2>
        <p className="text-sm text-gray-500 text-center max-w-sm">
          This is your central command center. View key metrics and overall platform health at a glance.
        </p>
      </div>
    </div>
  );
};

export default Overview;
