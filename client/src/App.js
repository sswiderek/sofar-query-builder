import React from 'react';
import sofarLogo from "./sofar-logo.png";

function App() {
  return (
    <div className="relative min-h-screen">
      {/* Background Image */}
      <div className="fixed inset-0">
        <img 
          src="/api/placeholder/1920/1080" 
          alt="Application Preview" 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Construction Overlay with reduced opacity */}
      <div className="fixed inset-0 bg-gray-800/80 z-50 flex items-center justify-center">
        <div className="text-center text-white">
          {/* Small Sofar Logo */}
          <img 
            src={sofarLogo} 
            alt="Sofar Logo" 
            className="w-24 h-auto mx-auto mb-8"  // Smaller logo size
          />
          
          {/* Construction Message */}
          <div className="text-4xl mb-4">🚧</div>
          <h1 className="text-3xl font-bold mb-2">Under Construction</h1>
          <p className="text-lg max-w-md px-4 mx-auto">
            Currently building something awesome! This application is under active development and will be available soon.
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
