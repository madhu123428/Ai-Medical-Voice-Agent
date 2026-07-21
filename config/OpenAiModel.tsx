import OpenAI from "openai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("⚠️ Warning: GEMINI_API_KEY environment variable is missing in .env.local!");
}

export const openai = new OpenAI({
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
  apiKey: apiKey || "dummy-key-for-vercel-build",
});