const aiClient = require("./aiClient")

exports.enhanceResume = async (resume) => {

const prompt = `
You are a senior technical recruiter and ATS optimization expert.

Your task is to enhance the resume while keeping all facts truthful.

You must:
- Improve the professional summary
- Strengthen experience and project bullet points
- Improve action verbs
- Increase ATS keyword relevance
- Improve clarity and impact
- Suggest missing skills


Do NOT fabricate achievements or add fake experience.

You will receive a resume JSON structure.

Return an OPTIMIZED VERSION of the resume while keeping the same structure.

RESUME JSON
-----------
${JSON.stringify(resume, null, 2)}

OUTPUT FORMAT (STRICT JSON ONLY)

{
  "atsScoreBefore": number,
  "atsScoreAfter": number,
  "optimizedResume": {
      "basics": {},
      "sections": []
  },
  "missingSkills": [],
  "improvementNotes": []
}

Rules:
- Keep the same section structure
- Only improve text clarity and impact
- Do not invent new companies or projects
- Preserve the JSON format
`

const raw = await aiClient.generateText(prompt,{
temperature:0.2,
topP:0.8
})

const cleaned = raw.replace(/```json|```/g,"").trim()

return JSON.parse(cleaned)

}
function extractJSON(text){

  const match = text.match(/\{[\s\S]*\}/)

  if(!match){
    throw new Error("No JSON found in AI response")
  }

  return JSON.parse(match[0])
}
exports.enhanceResumeWithJD = async (resume, jd)=>{

const prompt = `
You are a strict ATS resume optimizer.

You MUST follow ALL rules below:

RULES:
1. Return ONLY valid JSON (no explanation, no text before/after)
2. Do NOT use markdown (no **, no backticks, no formatting symbols)
3. Do NOT write anything outside JSON
4. Ensure JSON is parseable by JSON.parse()
5. Do NOT hallucinate fake experience or unrealistic numbers

TASK:
- Improve resume bullets with strong action verbs
- Add measurable impact where possible
- Tailor resume based on job description if provided
- Identify missing skills from JD

OUTPUT FORMAT (STRICT):

{
  "optimizedResume": {
    "basics": {
      "fullName": "",
      "email": "",
      "phone": "",
      "location": "",
      "links": []
    },
    "sections": []
  },
  "atsScoreBefore": 0,
  "atsScoreAfter": 0,
  "missingSkills": [],
  "improvementNotes": []
}

IMPORTANT:
- "optimizedResume" must follow same structure as input
- "sections" must NOT be removed or renamed
- Always return arrays (never null or undefined)

Resume JSON:
${JSON.stringify(resume)}

Job Description:
${jd || "Not provided"}
`

let raw


  raw = await aiClient.generateText(prompt,{
temperature:0.2,
topP:0.8
})
  // console.log("Raw AI Response:", raw);
  const cleaned = raw.replace(/```json|```/g,"").trim()
  // console.log("Cleaned AI Response:", cleaned);
  return JSON.parse(cleaned)


}