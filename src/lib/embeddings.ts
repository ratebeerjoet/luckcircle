import OpenAI from "openai";

// Initialize OpenAI client
// Ensure process.env.OPENAI_API_KEY is set
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function generateEmbedding(text: string) {
    try {
        const response = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: text.replace(/\n/g, " "),
        });
        return response.data[0].embedding;
    } catch (error) {
        console.error("Error generating embedding:", error);
        throw error;
    }
}
