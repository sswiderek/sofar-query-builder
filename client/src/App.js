import React from 'react';
import sofarLogo from "./sofar-logo.png";

function App() {
  return (
    <div className="min-h-screen bg-white">
      {/* Fixed overlay container */}
      <div className="fixed inset-0 bg-gray-900/75 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 max-w-2xl w-full text-center shadow-2xl">
          {/* Logo container */}
          <div className="mb-6">
            <img 
              src={sofarLogo} 
              alt="Sofar Logo" 
              className="h-12 w-auto mx-auto"
            />
          </div>

          {/* Construction content */}
          <div className="space-y-4 text-white">
            <div className="text-5xl">🚧</div>
            <h1 className="text-4xl font-bold tracking-tight">
              Under Construction
            </h1>
            <p className="text-lg text-gray-200 max-w-md mx-auto">
              Currently building something awesome! This application is under active development and will be available soon.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
