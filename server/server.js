// server.js (Updated for ES Modules)
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import OpenAI from "openai";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env file

// 1️⃣ Create Express app
const app = express();

// 2️⃣ Middleware
app.use(cors());
app.use(bodyParser.json());

// ✅ Default route for testing if the backend is running
app.get("/", (req, res) => {
  res.send("✅ Sofar API Backend is Running! Use the API endpoints.");
});

// 3️⃣ Configure OpenAI (✅ Corrected for ES modules)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Uses API key from .env
});

// 4️⃣ Endpoint: Convert user query into an AI-generated API request
app.post("/api/generate-query", async (req, res) => {
  const userPrompt = req.body.prompt || "";

  // System instructions for ChatGPT
  const systemPrompt = `
    You are an AI that converts natural-language requests into JSON for Sofar's 'latest-data' API.
    Respond with JSON in this format:
    {
      "endpoint": "latest-data",
      "parameters": {
        "token": "${process.env.SOFAR_API_KEY}",
        "spotterId": "SPOT-30344R",
        "processingSources": "embedded",
        "includeWindData": false,
        "includeSurfaceTempData": false,
        "includeBatteryStatus": false,
        "includeDirectionalMoments": false,
        "realTimeOnly": true
      }
    }

    Rules:
    - Default spotterId = "SPOT-30344R" unless specified by user.
    - If user mentions "wind data", set includeWindData = true.
    - If user mentions "battery", set includeBatteryStatus = true.
    - If user mentions "wave directions", set includeDirectionalMoments = true.
    - If user mentions "surface temperature", set includeSurfaceTempData = true.
    - Only output valid JSON.
  `;

  try {
    // Send prompt to OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0,
    });

    const rawOutput = response.choices[0].message.content.trim();

    let jsonData;
    try {
      jsonData = JSON.parse(rawOutput);
    } catch (err) {
      return res.json({
        error: "Failed to parse AI output as JSON",
        rawOutput,
      });
    }

    res.json(jsonData);
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    res.status(500).json({ error: error.message });
  }
});

// 5️⃣ Endpoint: Use the AI-generated JSON to call Sofar's API
app.post("/api/sofar-call", async (req, res) => {
  const aiQuery = req.body.aiQuery;
  if (!aiQuery || !aiQuery.parameters) {
    return res.status(400).json({ error: "Missing or invalid aiQuery" });
  }

  const { token, spotterId, processingSources, includeWindData, includeSurfaceTempData, includeBatteryStatus, includeDirectionalMoments, realTimeOnly } = aiQuery.parameters;

  // Construct the Sofar API query string
  const params = new URLSearchParams({ token, spotterId });
  if (processingSources) params.append("processingSources", processingSources);
  if (includeWindData) params.append("includeWindData", "true");
  if (includeSurfaceTempData) params.append("includeSurfaceTempData", "true");
  if (includeBatteryStatus) params.append("includeBatteryStatus", "true");
  if (includeDirectionalMoments) params.append("includeDirectionalMoments", "true");
  if (realTimeOnly) params.append("realTimeOnly", "true");

  const sofarUrl = `https://api.sofarocean.com/api/latest-data?${params.toString()}`;

  try {
    const sofarResponse = await fetch(sofarUrl);
    const sofarData = await sofarResponse.json();
    res.json(sofarData);
  } catch (error) {
    console.error("Error calling Sofar API:", error);
    res.status(500).json({ error: error.message });
  }
});

// 6️⃣ Start server
const PORT = 5050; // Keep using 5050 instead of 5000
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});


