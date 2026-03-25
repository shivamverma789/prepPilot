const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

exports.generateText = async (prompt, options = {}) => {
    try {

        const {
            temperature = 0.7,
            topP = 0.9
        } = options;

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [
                {
                    role: "user",
                    parts: [{ text: prompt }]
                }
            ],
            generationConfig: {
                temperature,
                topP
            }
        });
        const text = response.text;

        if (!text) {
            throw new Error("Empty AI response");
        }
        return text.trim();
    } catch (error) {
        console.error("AI Client Error:", error.message);
        throw error;
    }
};