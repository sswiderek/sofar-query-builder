import React, { useState } from "react";
import "./App.css"; // Ensure styles are applied
import sofarLogo from "./sofar-logo.png";

function App() {
  const [userPrompt, setUserPrompt] = useState("");
  const [apiResponse, setApiResponse] = useState(null);
  const [aiGeneratedQuery, setAiGeneratedQuery] = useState(null);
  const [apiRequestUrl, setApiRequestUrl] = useState("");

  async function handleGenerate() {
    setApiResponse(null);
    setAiGeneratedQuery(null);
    setApiRequestUrl("");

    try {
      console.log("🔄 Sending request to AI Query Builder...");

      const queryResp = await fetch("http://localhost:5050/api/generate-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userPrompt }),
      });

      const queryData = await queryResp.json();
      console.log("✅ AI-Generated Query:", queryData);
      setAiGeneratedQuery(queryData);

      console.log("🔄 Sending request to Sofar API...");
      const sofarResp = await fetch("http://localhost:5050/api/sofar-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aiQuery: queryData }),
      });

      const sofarData = await sofarResp.json();
      console.log("✅ Sofar API Response:", sofarData);
      setApiResponse(sofarData);

      // Construct API URL from response
      const queryParams = new URLSearchParams(queryData.parameters).toString();
      setApiRequestUrl(`https://api.sofarocean.com/api/latest-data?${queryParams}`);
    } catch (error) {
      console.error("❌ Error:", error);
    }
  }

  function filterData() {
    if (!apiResponse || !apiResponse.data) return {};

    const filteredData = {};
    const prompt = userPrompt.toLowerCase();

    if (prompt.includes("wind")) {
      filteredData.wind = apiResponse.data.wind ? apiResponse.data.wind[0] : null;
    }
    if (prompt.includes("wave")) {
      filteredData.waves = apiResponse.data.waves ? apiResponse.data.waves[0] : null;
    }
    if (prompt.includes("battery")) {
      filteredData.batteryVoltage = apiResponse.data.batteryVoltage;
    }
    if (prompt.includes("humidity")) {
      filteredData.humidity = apiResponse.data.humidity;
    }

    return filteredData;
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
          />
          <button className="generate-btn" onClick={handleGenerate}>
            🚀 Generate & Fetch
          </button>

          {apiResponse && (
            <div className="retrieved-data">
              <h3>📊 Retrieved Data</h3>
              <p className="retrieved-data-description">
                Here's the latest real-time ocean data based on your request:
              </p>
              <ul>
                {/* Wind Data */}
                {filteredResponse.wind && (
                  <li>
                    🌬️ <b>Wind Speed:</b> {filteredResponse.wind.speed} m/s —
                    Stronger winds can mean choppier waters and faster sailing speeds!
                  </li>
                )}

                {/* Wave Height Data */}
                {filteredResponse.waves && (
                  <li>
                    🌊 <b>Wave Height:</b> {filteredResponse.waves.significantWaveHeight} m —
                    Bigger waves could signal rough conditions or great surf!
                  </li>
                )}

                {/* Battery Voltage */}
                {filteredResponse.batteryVoltage !== undefined && (
                  <li>
                    🔋 <b>Battery Voltage:</b> {filteredResponse.batteryVoltage}V —
                    Your Spotter buoy is running on a solid charge.
                  </li>
                )}

                {/* Humidity */}
                {filteredResponse.humidity !== undefined && (
                  <li>
                    💧 <b>Humidity:</b> {filteredResponse.humidity}% —
                    High humidity levels can affect weather conditions and ocean evaporation.
                  </li>
                )}
              </ul>
            </div>
          )}

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

        {/* Right Panel: How it Works Section */}
        <div className="right-panel">
          <h2>🌊 AI-Assisted Query Builder – How It Works 💡</h2>
          <p>
            This tool helps users interact with Sofar Ocean’s API using natural language. It translates user queries into structured API requests.
          </p>

          <h3>🔹 How to Use:</h3>
          <ol>
            <li>Type a question about ocean conditions (e.g., “Show me wind speed and wave height”).</li>
            <li>Click <b>Generate & Fetch</b> to see the AI-translated API request.</li>
            <li>View the real-time ocean data retrieved from Sofar’s Spotter platform.</li>
          </ol>

          <h3>⚙️ Key Features:</h3>
          <ul>
            <li>💡 AI-powered API query generation</li>
            <li>📡 Real-time ocean intelligence</li>
            <li>⚡ Fast and scalable API integration</li>
          </ul>

          <h3>📌 Need to Know:</h3>
          <ul>
            <li>
              The AI is trained to work with Sofar’s <b>"latest-data"</b> endpoint. Some API requests (e.g., historical data) are not currently supported.
            </li>
            <li>
              This tool is leveraging a trial Sofar account, meaning the API key and spotter ID used are tied to that account and may expire in the future.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
