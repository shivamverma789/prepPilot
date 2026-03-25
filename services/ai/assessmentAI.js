const aiClient = require("./aiClient");

exports.generateSubtopicQuiz = async ({ subtopicTitle, skillTitle, userLevel }) => {
    try {
        const prompt = `
You are an expert technical interviewer and learning assessor.

Generate a 5-question MCQ quiz to assess a student's understanding.

CONTEXT:
- Skill: ${skillTitle}
- Subtopic: ${subtopicTitle}
- User Level: ${userLevel || "Beginner"}

QUIZ RULES:
1. Exactly 5 MCQ questions
2. Start basic (Q1-2), then intermediate (Q3-4), then depth (Q5)
3. Each question must have 4 options
4. Only ONE correct answer
5. Include short explanation
6. Beginner-friendly but concept-checking
7. No trick or ambiguous questions

OUTPUT STRICT JSON:
[
  {
    "question": "Clear MCQ question",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option A",
    "explanation": "Short explanation",
    "concept": "Specific concept inside the subtopic",
    "difficulty": "basic"
  }
]

Each question MUST include:
- concept (the exact concept being tested)
- difficulty (basic/intermediate/advanced)

CRITICAL:
- Each question MUST include a "concept" field
- Concept must be a specific learning concept inside the subtopic
- NEVER omit the concept field


IMPORTANT:
- Output ONLY valid JSON
- No markdown
- No extra text
`;

        const raw = await aiClient.generateText(prompt);

        const cleaned = raw
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        return JSON.parse(cleaned);

    } catch (err) {
        console.error("Assessment AI Error:", err.message);
        return [];
    }
};
