const { generateText } = require("./aiClient")

exports.parseResumeFromText = async (text) => {

const prompt = `
You are a resume parser.

Convert the given resume text into STRICT JSON format.

RULES:
- Output ONLY valid JSON (no explanation, no markdown)
- Do NOT include duplicate sections
- Extract clean structured data

FORMAT:

{
  "basics": {
    "fullName": "",
    "email": "",
    "phone": "",
    "location": "",
    "links": [
      { "label": "LinkedIn", "url": "" },
      { "label": "GitHub", "url": "" }
    ]
  },

  "sections": [

    {
      "title": "Summary",
      "type": "text",
      "data": ""
    },

    {
      "title": "Skills",
      "type": "grouped-list",
      "data": [
        { "group": "Technical Skills", "items": [] }
      ]
    },

    {
      "title": "Experience",
      "type": "entries",
      "data": [
        {
          "title": "",
          "subtitle": "",
          "location": "",
          "startDate": "",
          "endDate": "",
          "bullets": [
            { "text": "" }
          ]
        }
      ]
    },

    {
      "title": "Projects",
      "type": "entries",
      "data": []
    },

    {
      "title": "Education",
      "type": "entries",
      "data": []
    }

  ]
}

IMPORTANT:
- DO NOT repeat sections
- If something missing → keep empty
- Clean bullet points properly

RESUME TEXT:
${text.slice(0, 6000)}
`

const raw = await generateText(prompt)

const cleaned = raw.replace(/```json|```/g, "").trim();

return JSON.parse(cleaned)

}