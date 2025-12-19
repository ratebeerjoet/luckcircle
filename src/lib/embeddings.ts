import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

export async function generateEmbedding(text: string) {
    try {
        const result = await model.embedContent(text.replace(/\n/g, " "));
        const embedding = result.embedding;
        return embedding.values;
    } catch (error) {
        console.error("Error generating embedding with Gemini:", error);
        throw error;
    }
}
