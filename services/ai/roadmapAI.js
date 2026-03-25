const aiClient = require("./aiClient");


const buildUserProfileForAI = (user) => {
    const academic = user.academic || {};
    const skills = user.skills || [];
    const experience = user.experience || {};

    const formattedSkills = skills.map(s =>
        `${s.name} (${s.level}, ${s.exposure}, confidence ${s.confidence}/5)`
    ).join(", ");

    return `
User Profile:
- Career Goals: ${(user.careerGoals || []).join(", ")} ${(user.customGoals || []).join(", ")}
- Target Company: ${user.targetCompanyType || "product"}
- Academic: ${academic.year || user.year || ""} ${academic.degree || user.degree || ""} ${academic.branch || ""}
- Skills: ${formattedSkills || "Beginner"}
- Projects Built: ${experience.projectsCount || "0"}
- Internship Experience: ${experience.internshipExperience ? "Yes" : "No"}
- Daily Study Time: ${experience.dailyStudyHours || "1-3 hours"}
- Resume Ready: ${experience.resumeReady ? "Yes" : "No"}
`;
};


exports.generatePersonalizedRoadmap = async (user) => {
    try {
        const userProfileText = buildUserProfileForAI(user);
        const prompt = `
You are an elite mentor, curriculum architect, and placement coach.

Your job is to design a DEEPLY PERSONALIZED, PHASE-WISE learning roadmap that takes a student from their CURRENT REAL LEVEL to JOB-READY level.

${userProfileText}

PERSONALIZATION INTELLIGENCE RULES (VERY IMPORTANT):

1. SKILL LEVEL INTERPRETATION:
   - If confidence <= 2 OR exposure = "heard" → Treat as Beginner
   - If exposure = "learned" but no projects → Treat as Early Intermediate
   - If exposure = "projects" or "confident" with high confidence → Can increase difficulty gradually
   - Never assume mastery just because a skill is listed

2. SKILL GAP DETECTION:
   - If core fundamentals (HTML, CSS, JS, DSA, OOP) are weak or missing, start from fundamentals
   - Do NOT skip basics even if user mentions advanced goals
   - Build strong foundations before advanced topics

3. STUDY TIME ADAPTATION:
   - If daily study time < 2 hours → slower, more digestible roadmap
   - If 3+ hours → slightly accelerated roadmap with more projects

4. EXPERIENCE AWARENESS:
   - If projects count = 0 → include many mini beginner projects
   - If no internship → add portfolio + resume + internship prep phases
   - If resume not ready → include resume building phase

5. GOAL ALIGNMENT:
   - Align the roadmap strictly with the user's career goals
   - Example:
     - Full Stack → MERN + Projects + Deployment
     - SDE → DSA + CS Fundamentals + Projects
     - Product-based companies → DSA + System Design + Core CS

6. BEGINNER-FIRST PRINCIPLE:
   - Roadmap MUST feel achievable, not overwhelming
   - No unrealistic tasks like "Solve 500 LeetCode" early
   - Break everything into small actionable subtopics

STRUCTURE REQUIREMENTS (STRICT):

- Create 6 to 10 logical phases (progressive difficulty)
- Each phase = a learning stage (not random topics)
- Each phase must contain 2-3 skills
- Each skill must contain 5-8 subtopics (deep learning checklist)
- Each subtopic MUST be beginner-friendly and sequential
- Include mini projects that match the phase difficulty (easy → advanced)

OUTPUT MUST MATCH THIS EXACT JSON STRUCTURE:
[
  {
    "phase": "Phase 1: Foundations",
    "skills": [
      {
        "title": "Skill Name",
        "subtopics": [
          {
            "title": "Specific Concept Name",
            "resources": [
              {
                "title": "Beginner Friendly Resource Name",
                "url": "VALID_URL",
                "type": "youtube"
              },
              {
                "title": "Official Documentation",
                "url": "VALID_URL",
                "type": "docs"
              }
            ]
          }
        ],
        "miniProject": {
          "title": "Project Title",
          "description": "Short practical project description aligned with the phase"
        }
      }
    ]
  }
]

DETAILED CURRICULUM DECOMPOSITION RULES (CRITICAL):

1. NEVER keep skills at a high level like "Learn MongoDB", "Learn OOP", or "Learn DBMS".
2. Each skill MUST be broken into granular, concept-level subtopics for mastery.
3. Subtopics must represent ACTUAL concepts a student studies step-by-step.

Example (GOOD):
Skill: MongoDB
Subtopics:
- BSON and Document Structure
- CRUD Operations
- Schema Design and Validation
- Indexing and Performance Basics
- Aggregation Framework Basics
- Mongoose Models and Relationships

Example (BAD - DO NOT DO THIS):
- Learn MongoDB Basics
- Study MongoDB Advanced
- Practice MongoDB

4. Every subtopic must be specific, teachable, and implementation-oriented.
5. Subtopics must follow a logical learning progression (fundamentals → advanced).
6. Avoid vague subtopics like:
   - "Understand concepts"
   - "Practice problems"
   - "Learn basics"
7. Prefer technical breakdown like:
   - DOM Manipulation
   - Event Loop
   - REST APIs
   - Middleware
   - Indexing
   - Authentication (JWT)


RESOURCE GENERATION RULES (ABSOLUTE & NON-NEGOTIABLE):

For EVERY subtopic, you MUST provide EXACTLY 2 resources:
1) One YouTube resource (type: "youtube")
2) One Documentation resource (type: "docs")

Do NOT provide more than 2 resources.
Do NOT provide only one resource.
Do NOT skip resources for any subtopic.

YOUTUBE RESOURCE RULES (STRICT):
- NEVER generate specific video or playlist links
- NEVER invent video IDs or playlist IDs
- ALWAYS use YouTube SEARCH links ONLY
- Format MUST be:
  https://www.youtube.com/results?search_query=TOPIC_NAME+tutorial
- The search query must be highly relevant and beginner-friendly

Example:
If subtopic = "JavaScript Closures"
You MUST output:
https://www.youtube.com/results?search_query=JavaScript+Closures+tutorial

DOCUMENTATION RESOURCE RULES (STRICT PRIORITY ORDER):
Use ONLY trusted and beginner-safe documentation sources:
1. MDN Web Docs (for Web/JS/HTML/CSS)
2. Official Documentation (React Docs, Node Docs, MongoDB Docs, etc.)
3. FreeCodeCamp Guides
4. GeeksforGeeks (only if official docs are not suitable)

DO NOT use:
- Random blogs
- Medium articles
- Broken or unknown websites
- Fake documentation links

RESOURCE FORMAT (MANDATORY STRUCTURE):
"resources": [
  {
    "title": "Beginner Tutorial on TOPIC",
    "url": "https://www.youtube.com/results?search_query=TOPIC+tutorial",
    "type": "youtube"
  },
  {
    "title": "Official Documentation for TOPIC",
    "url": "VALID_TRUSTED_DOC_LINK",
    "type": "docs"
  }
]

FAIL-SAFE INSTRUCTION:
If you are unsure about an exact documentation page,
provide a safe official homepage (like MDN or official docs)
instead of guessing a deep link.

NEVER output:
- Empty resources array
- Only YouTube
- Only Docs
- Invalid URLs
- Non-working playlist links


MINI PROJECT GENERATION RULES (VERY IMPORTANT):

1. Each mini project must be PRACTICAL and SKILL-REINFORCING, not generic.
2. The project must directly align with the skills and subtopics learned in that phase.
3. The description MUST clearly specify:
   - What the project is
   - Core features that MUST be implemented
   - What skills it reinforces
4. Projects should progress in difficulty:
   - Phase 1-2: Very beginner projects
   - Mid phases: Intermediate real-world apps
   - Final phases: Resume-worthy production-level projects
5. Avoid vague descriptions like "Build a website" or "Create an app".
6. Use structured, detailed, implementation-focused descriptions.

Example GOOD mini project description:
"Build a Task Manager Web App. MUST include: CRUD operations, DOM manipulation, event handling, local storage persistence, and responsive UI. This project reinforces JavaScript fundamentals, DOM, and state handling."


FINAL HARD RULES:
- Output ONLY valid JSON
- No markdown
- No explanation
- No extra text
- Ensure JSON is perfectly parsable
- Make the roadmap extremely beginner-friendly but job-oriented
`;





        const raw = await aiClient.generateText(prompt);

        // Clean JSON (Gemini often wraps in ```json)
        const cleaned = raw
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        const tasks = JSON.parse(cleaned);

        return tasks;
    } catch (err) {
        console.error("Roadmap AI Error:", err.message);
        return [];
    }
};
