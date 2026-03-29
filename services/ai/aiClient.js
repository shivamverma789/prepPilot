const { GoogleGenAI } = require("@google/genai");

// 🔑 Load multiple API keys (add more in .env)
const API_KEYS = [
    process.env.GEMINI_API_KEY_1,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3
].filter(Boolean);

if (API_KEYS.length === 0) {
    throw new Error("❌ No Gemini API keys found in environment variables");
}

let keyIndex = 0;

// 🔄 Rotate API keys
function getNextKey() {
    const key = API_KEYS[keyIndex];
    keyIndex = (keyIndex + 1) % API_KEYS.length;
    return key;
}

// 🧠 Create AI client dynamically
function createClient() {
    return new GoogleGenAI({
        apiKey: getNextKey(),
    });
}

// ⏳ Delay helper
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

/**
 * 🔥 Main AI function
 */
exports.generateText = async (prompt, options = {}) => {
    const {
        temperature = 0.7,
        topP = 0.9,
        retries = 3,
        model = "gemini-3-flash-preview"
    } = options;

    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            const ai = createClient();

            const response = await ai.models.generateContent({
                model,
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

            if (!text || text.trim().length === 0) {
                throw new Error("Empty AI response");
            }

            return text.trim();

        } catch (error) {
            const status = error.status;

            console.error(`⚠️ AI Error (attempt ${attempt + 1}):`, error.message);

            // 🔁 Retry for rate limit / overload
            if ((status === 429 || status === 503) && attempt < retries - 1) {
                const waitTime = 2000 * (attempt + 1);
                console.log(`⏳ Retrying in ${waitTime}ms...`);
                await delay(waitTime);
                continue;
            }

            // 🚫 Quota exceeded
            if (status === 429) {
                throw new Error("AI quota exceeded. Please try again later.");
            }

            // 🚫 Server overloaded
            if (status === 503) {
                throw new Error("AI service busy. Try again shortly.");
            }

            // ❌ Unknown error
            throw new Error(error.message || "AI request failed");
        }
    }
};