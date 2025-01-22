import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch"; // Ensure node-fetch is installed in package.json

// Load environment variables from .env
dotenv.config();

// Validate required environment variables
if (!process.env.SOFAR_API_KEY) {
  console.error("❌ ERROR: Missing SOFAR_API_KEY in environment variables");
  process.exit(1);
}

if (!process.env.OPENAI_API_KEY) {
  console.error("❌ ERROR: Missing OPENAI_API_KEY in environment variables");
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5050; // Default to port 5050

// Middleware
app.use(cors());
app.use(express.json());

// Test Route
app.get("/", (req, res) => {
  res.send("✅ Sofar API Backend is Running! Use the API endpoints.");
});

// API Endpoint: Generate AI Query
app.post("/api/generate-query", async (req, res) => {
  try {
    const userPrompt = req.body.prompt;
    if (!userPrompt) {
      return res.status(400).json({ error: "Missing prompt in request body" });
    }

    console.log("🔍 Processing AI query for:", userPrompt);

    const aiResponse = await fetch("https://api.openai.com/v1/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        prompt: `Translate this user request into a structured Sofar API query: "${userPrompt}"`,
        max_tokens: 50,
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`OpenAI API Error: ${aiResponse.statusText}`);
    }

    const aiData = await aiResponse.json();
    console.log("🧠 AI Generated Query:", aiData);
    res.json(aiData);
  } catch (error) {
    console.error("❌ Error in /api/generate-query:", error);
    res.status(500).json({ error: "Failed to process AI query" });
  }
});

// API Endpoint: Fetch Sofar API Data
app.post("/api/sofar-call", async (req, res) => {
  try {
    const aiQuery = req.body.aiQuery;
    if (!aiQuery) {
      return res.status(400).json({ error: "Missing AI-generated query in request body" });
    }

    console.log("🌊 Fetching Sofar API data for:", aiQuery);

    const queryParams = new URLSearchParams({
      spotterId: "SPOT-30344R",
      token: process.env.SOFAR_API_KEY,
    });

    const sofarResponse = await fetch(`https://api.sofarocean.com/api/latest-data?${queryParams}`);

    if (!sofarResponse.ok) {
      throw new Error(`Sofar API Error: ${sofarResponse.statusText}`);
    }

    const sofarData = await sofarResponse.json();
    console.log("✅ Sofar API Response:", sofarData);
    res.json(sofarData);
  } catch (error) {
    console.error("❌ Error in /api/sofar-call:", error);
    res.status(500).json({ error: "Failed to retrieve Sofar API data" });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
