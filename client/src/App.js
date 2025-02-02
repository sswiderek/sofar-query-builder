import React from 'react';
import { Construction } from 'lucide-react';
import sofarLogo from "sofar-logo.png";

function App() {
  return (
    <div className="relative min-h-screen">
      {/* Construction Overlay */}
      <div className="fixed inset-0 bg-gray-800/90 z-50 flex flex-col items-center justify-center text-white">
        <Construction className="w-16 h-16 mb-4" />
        <h1 className="text-3xl font-bold mb-2">Under Construction</h1>
        <p className="text-lg text-center max-w-md px-4">
          Currently building something awesome! This application is under active development and will be available soon.
        </p>
      </div>

      {/* Original App Content (now blurred and non-interactive) */}
      <div className="blur-sm pointer-events-none">
        <div className="container">
          <div className="background-overlay"></div>
          <header className="header">
            <img src={sofarLogo} alt="Sofar Logo" className="sofar-logo" />
          </header>
          {/* Rest of your app content */}
        </div>
      </div>
    </div>
  );
}

export default App;
