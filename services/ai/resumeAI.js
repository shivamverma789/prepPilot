// resumeAI.js
const aiClient = require("./aiClient");

exports.analyze = async (resumeText) => {

const prompt = `
You are a strict ATS (Applicant Tracking System) and senior technical recruiter.

Analyze the resume using structured, weighted scoring. 
Be analytical. Do NOT be creative. Do NOT inflate scores.

=====================
SCORING FRAMEWORK
=====================

Score each section independently using these weights:

- ATS Compatibility (15)
- Keyword Optimization (20)
- Project Quality & Technical Depth (20)
- Experience Strength & Relevance (15)
- Structure & Clarity (15)
- Quantification & Impact Metrics (15)

Each section must be scored realistically.
Then compute:

atsScore = sum of all section scores (out of 100)

SCORING CONSISTENCY RULE:
If the same resume is analyzed multiple times without modification,
the final ATS score must remain within ±3 variation.
Avoid arbitrary fluctuation.

=====================
SEVERITY CLASSIFICATION
=====================

First classify the resume overall as:
- Strong (80+)
- Moderate (60–79)
- Weak (<60)

Improvement generation must depend on this classification:

- Strong → 1–3 targeted refinements only.
- Moderate → 3–6 concrete improvements.
- Weak → 6–10 specific, actionable improvements.

Do NOT generate filler advice.
Only generate improvements if clearly needed.

Rewrite examples:
- Provide rewrites ONLY for weak, vague, or unquantified bullet points.
- If resume is already strong and clear, return empty rewriteExamples array.
- Rewrites must improve clarity, impact, quantification, or technical specificity.
- Do NOT fabricate achievements.

=====================
KEYWORD ANALYSIS
=====================

- Identify missing important technical keywords based on resume domain.
- Only include relevant missing skills.
- Do NOT guess irrelevant technologies.

=====================
CRITICAL ISSUES
=====================

List structural or strategic problems such as:
- No metrics
- Poor formatting
- No technical stack clarity
- Generic bullet points
- Lack of ownership
- Missing core skills

=====================
RESUME
=====================

${resumeText}

=====================
OUTPUT FORMAT
=====================

Return STRICT JSON only:

{
  "atsScore": number,
  "classification": "Strong | Moderate | Weak",
  "breakdown": {
    "atsCompatibility": number,
    "keywordOptimization": number,
    "projectQuality": number,
    "experienceStrength": number,
    "structureClarity": number,
    "quantification": number
  },
  "criticalIssues": [],
  "missingKeywords": [],
  "improvementSuggestions": [],
  "rewriteExamples": [
    {
      "original": "",
      "improved": ""
    }
  ]
}

Hard Rules:
- No markdown.
- No explanation outside JSON.
- No motivational language.
- No generic advice.
- All numbers must add correctly to atsScore.
- Ensure JSON is valid and parsable.
`;
    const raw = await aiClient.generateText(prompt, {
        temperature: 0.2,
        topP: 0.8
    });

    const cleaned = raw.replace(/```json|```/g, "").trim();

    return JSON.parse(cleaned);
};

exports.analyzeWithJD = async (resumeText, jobDescription) => {

    const prompt = `
You are a strict ATS system and senior hiring manager.

Your task:
1) Evaluate the resume independently (general ATS strength).
2) Evaluate how well it matches the given Job Description.
Be analytical, not creative. Do NOT inflate scores.

================================================
SCORING FRAMEWORK
================================================

A) ATS Score (Out of 100)

Score using these weighted sections:

- ATS Compatibility (15)
- Keyword Optimization (20)
- Project Quality & Technical Depth (20)
- Experience Strength & Relevance (15)
- Structure & Clarity (15)
- Quantification & Impact Metrics (15)

atsScore = sum of above sections (must equal 100 max).

B) JD Match Score (Out of 100)

Evaluate ONLY based on alignment with the job description using:

- Core Technical Skill Match (40)
- Experience Relevance to Role (25)
- Domain Alignment (15)
- Responsibility Alignment (10)
- Tools / Stack Match (10)

jdMatchScore = sum of above (max 100).

SCORING CONSISTENCY RULE:
If the same resume and JD are analyzed multiple times,
scores must remain within ±3 variation.
Avoid arbitrary fluctuations.

================================================
SEVERITY CLASSIFICATION
================================================

Classify JD alignment as:
- Strong Match (80+)
- Partial Match (60–79)
- Weak Match (<60)

Tailoring suggestions must depend on severity:
- Strong Match → 1–3 refinements.
- Partial Match → 3–6 targeted adjustments.
- Weak Match → 6–10 concrete tailoring actions.

Do NOT generate filler advice.
Do NOT give generic statements like "improve formatting"
unless clearly necessary.

================================================
KEYWORD ANALYSIS RULES
================================================

- Extract core required skills from JD.
- Compare directly with resume.
- matchedSkills must contain only explicitly present skills.
- missingSkills must contain important JD skills absent in resume.
- Do NOT hallucinate skills not mentioned.

================================================
REWRITE RULES
================================================

- Provide rewrites ONLY for bullet points that:
  - Lack quantification
  - Lack clarity
  - Are not aligned with JD
- Do NOT fabricate achievements.
- If resume is already strong and aligned, return empty rewriteExamples array.

================================================
RESUME
================================================

${resumeText}

================================================
JOB DESCRIPTION
================================================

${jobDescription}

================================================
OUTPUT FORMAT (STRICT JSON ONLY)
================================================

{
  "atsScore": number,
  "jdMatchScore": number,
  "jdClassification": "Strong Match | Partial Match | Weak Match",
  "breakdown": {
    "atsCompatibility": number,
    "keywordOptimization": number,
    "projectQuality": number,
    "experienceStrength": number,
    "structureClarity": number,
    "quantification": number
  },
  "matchedSkills": [],
  "missingSkills": [],
  "criticalIssues": [],
  "tailoringSuggestions": [],
  "rewriteExamples": [
    {
      "original": "",
      "improved": ""
    }
  ]
}

Hard Rules:
- No markdown.
- No explanations.
- All section scores must sum correctly.
- No motivational language.
- JSON must be valid and parsable.
`;

    const raw = await aiClient.generateText(prompt, {
        temperature: 0.2,
        topP: 0.8
    });
    const cleaned = raw.replace(/```json|```/g, "").trim();

    return JSON.parse(cleaned);
};