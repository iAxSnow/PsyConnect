import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";

// Load environment variables from .env or .env.local
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" }); // Fallback

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
  console.error("❌ Error: NEXT_PUBLIC_GEMINI_API_KEY not found in env files");
  process.exit(1);
}

console.log(`🔑 Testing API Key: ${apiKey.substring(0, 8)}...`);

const genAI = new GoogleGenerativeAI(apiKey);

async function test() {
  const modelsToTest = ["gemini-2.0-flash", "gemini-3-pro", "gemini-1.5-flash"];
  
  for (const modelName of modelsToTest) {
      try {
        console.log(`\n🧪 Attempting to use model '${modelName}'...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Say 'API Working'");
        const response = await result.response;
        console.log(`✅ Success with '${modelName}'! Response:`, response.text());
        return; // Exit after first success
      } catch (error: any) {
        console.error(`❌ Failed with '${modelName}':`);
        console.error(error.message);
      }
  }
}

test();
