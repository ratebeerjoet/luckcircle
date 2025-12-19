import { generateEmbedding } from "../src/lib/embeddings";
import * as dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function verify() {
    console.log("🔍 Verifying Gemini Embeddings...");

    if (!process.env.GOOGLE_API_KEY) {
        console.error("❌ GOOGLE_API_KEY is missing from .env.local");
        process.exit(1);
    }

    const text = "The Luck Circle verification test.";

    try {
        const embedding = await generateEmbedding(text);
        if (Array.isArray(embedding) && embedding.length > 0) {
            console.log("✅ Success! Generated embedding with length:", embedding.length);
            console.log("First 5 values:", embedding.slice(0, 5));
        } else {
            console.error("❌ Failed: Result was not a valid array.");
        }
    } catch (error) {
        console.error("❌ Error generating embedding:", error);
    }
}

verify();
