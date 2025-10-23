function HomePage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Home</h1>
      
      <div className="space-y-4">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2">Post 1</h2>
          <p className="text-gray-600">
            This is some sample content to show the scrolling behavior. 
            The sidebar should stay fixed on the left while this content scrolls.
          </p>
        </div>
      </div>
    </div>
  );
}

export default HomePage;