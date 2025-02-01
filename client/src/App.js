import React, { useState } from "react";
import "./App.css";
import sofarLogo from "sofar-logo.png";

function App() {
  const [userPrompt, setUserPrompt] = useState("");
  const [apiResponse, setApiResponse] = useState(null);
  const [aiGeneratedQuery, setAiGeneratedQuery] = useState(null);
  const [apiRequestUrl, setApiRequestUrl] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleGenerate() {
    // Reset all states at the start
    setError(null);
    setApiResponse(null);
    setAiGeneratedQuery(null);
    setApiRequestUrl("");
    setIsLoading(true);

    try {
      // Step 1: Generate AI Query
      console.log("🔄 Sending request to AI Query Builder...");
      const queryResp = await fetch("https://sofar-backend.onrender.com/api/generate-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userPrompt }),
      });

      if (!queryResp.ok) {
        const errorData = await queryResp.json();
        throw new Error(`Query generation failed: ${errorData.details || errorData.error || 'Unknown error'}`);
      }

      const queryData = await queryResp.json();
      console.log("✅ AI-Generated Query:", queryData);
      
      // Validate the query structure
      if (!queryData.parameters) {
        throw new Error("AI response is missing parameters structure");
      }
      
      setAiGeneratedQuery(queryData);

      // Step 2: Call Sofar API
      console.log("🔄 Sending request to Sofar API...");
      const sofarResp = await fetch("https://sofar-backend.onrender.com/api/sofar-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aiQuery: queryData }),
      });

      if (!sofarResp.ok) {
        const errorData = await sofarResp.json();
        throw new Error(`Sofar API call failed: ${errorData.error || 'Unknown error'}`);
      }

      const sofarData = await sofarResp.json();
      console.log("✅ Sofar API Response:", sofarData);
      
      // Validate Sofar response data
      if (!sofarData.data) {
        throw new Error("Sofar API response is missing data structure");
      }

      setApiResponse(sofarData);

      // Construct and validate API URL
      const queryParams = new URLSearchParams(queryData.parameters).toString();
      setApiRequestUrl(`https://api.sofarocean.com/api/latest-data?${queryParams}`);

    } catch (error) {
      console.error("❌ Error:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  // Enhanced data filtering with error handling
  function filterData() {
    if (!apiResponse?.data) return {};

    try {
      const filteredData = {};
      const prompt = userPrompt.toLowerCase();

      // Wind data validation
      if (prompt.includes("wind") && apiResponse.data.wind?.length > 0) {
        filteredData.wind = apiResponse.data.wind[0];
      }

      // Wave data validation
      if (prompt.includes("wave") && apiResponse.data.waves?.length > 0) {
        filteredData.waves = apiResponse.data.waves[0];
      }

      // Battery data validation
      if (prompt.includes("battery") && typeof apiResponse.data.batteryVoltage === 'number') {
        filteredData.batteryVoltage = apiResponse.data.batteryVoltage;
      }

      // Humidity data validation
      if (prompt.includes("humidity") && typeof apiResponse.data.humidity === 'number') {
        filteredData.humidity = apiResponse.data.humidity;
      }

      return filteredData;
    } catch (error) {
      console.error("Error filtering data:", error);
      return {};
    }
  }

  const filteredResponse = filterData();

  return (
    <div className="container">
      <div className="background-overlay"></div>
      <header className="header">
        <img src={sofarLogo} alt="Sofar Logo" className="sofar-logo" />
      </header>

      <div className="content">
        <div className="left-panel">
          <textarea
            className="input-box"
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            placeholder="Ask about wave height, wind speed, etc."
            disabled={isLoading}
          />
          <button 
            className={`generate-btn ${isLoading ? 'loading' : ''}`} 
            onClick={handleGenerate}
            disabled={isLoading || !userPrompt.trim()}
          >
            {isLoading ? '🔄 Processing...' : '🚀 Generate & Fetch'}
          </button>

          {/* Error Display */}
          {error && (
            <div className="error-message">
              ❌ Error: {error}
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="loading-indicator">
              🔄 Processing your request...
            </div>
          )}

          {/* Results Display */}
          {apiResponse && (
            <div className="retrieved-data">
              <h3>📊 Retrieved Data</h3>
              {Object.keys(filteredResponse).length === 0 ? (
                <p>No matching data found for your query. Try asking about wind, waves, battery, or humidity.</p>
              ) : (
                <>
                  <p className="retrieved-data-description">
                    Here's the latest real-time ocean data based on your request:
                  </p>
                  <ul>
                    {filteredResponse.wind && (
                      <li>
                        🌬️ <b>Wind Speed:</b> {filteredResponse.wind.speed.toFixed(1)} m/s
                      </li>
                    )}

                    {filteredResponse.waves && (
                      <li>
                        🌊 <b>Wave Height:</b> {filteredResponse.waves.significantWaveHeight.toFixed(2)} m
                      </li>
                    )}

                    {filteredResponse.batteryVoltage !== undefined && (
                      <li>
                        🔋 <b>Battery Voltage:</b> {filteredResponse.batteryVoltage.toFixed(2)}V
                      </li>
                    )}

                    {filteredResponse.humidity !== undefined && (
                      <li>
                        💧 <b>Humidity:</b> {filteredResponse.humidity.toFixed(1)}%
                      </li>
                    )}
                  </ul>
                </>
              )}
            </div>
          )}

          {/* Debug Information */}
          {aiGeneratedQuery && (
            <div className="code-box">
              <h4>🧠 AI-Generated Schema:</h4>
              <pre>{JSON.stringify(aiGeneratedQuery, null, 2)}</pre>
            </div>
          )}

          {apiRequestUrl && (
            <div className="code-box">
              <h4>🌍 API Request to Sofar:</h4>
              <pre>{apiRequestUrl}</pre>
            </div>
          )}
        </div>

        {/* Right Panel remains the same */}
        <div className="right-panel">
          {/* ... existing right panel content ... */}
        </div>
      </div>
    </div>
  );
}

export default App;
