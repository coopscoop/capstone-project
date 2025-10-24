const HomePage = () => {
  return (
    <div className="h-full flex flex-col">
      {/* Content */}
      <div className="flex-1 overflow-auto bg-dark-bg">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Welcome Section */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">
              Welcome back!
            </h2>
            <p className="text-white text-lg">
              Welcome to your dashboard. It looks like you're new here. Let's get you started!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;