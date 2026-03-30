const Resume = require("../models/resumeModel");
const puppeteer = require("puppeteer");
const ejs = require("ejs");
const path = require("path");
const { enhanceResume,enhanceResumeWithJD  } = require("../services/ai/resumeEnhancer")
const { parseResumeFromText } = require("../services/ai/resumeParser")


exports.getDashboard = async (req,res)=>{

try{

if(!req.isAuthenticated()){
return res.redirect("/login")
}

const resumes = await Resume.find({
userId:req.user._id
}).sort({createdAt:-1})

res.render("resumeBuilder/dashboard",{resumes})

}
catch(err){

console.error(err)
res.send("Error loading resumes")

}

}

exports.createResume = async (req, res) => {

  try {

    if (!req.isAuthenticated()) {
      return res.redirect("/login");
    }

    const defaultSections = [

      {
        title: "Professional Summary",
        type: "text",
        order: 1,
        data: "",
        isRequired: true
      },

      {
        title: "Skills",
        type: "grouped-list",
        order: 2,
        data: [
          
        ],
        isRequired: true
      },

      {
        title: "Experience",
        type: "entries",
        order: 3,
        data: [],
        isRequired: true
      },

      {
        title: "Projects",
        type: "entries",
        order: 4,
        data: [],
        isRequired: false
      },

      {
        title: "Education",
        type: "entries",
        order: 5,
        data: [],
        isRequired: true
      }

    ];

    const resume = await Resume.create({

      userId: req.user._id,

      title: "Untitled Resume",

      basics: {
        fullName: "",
        email: "",
        phone: "",
        location: "",
        links: []
      },

      sections: defaultSections

    });

    res.redirect(`/builder/${resume._id}/editor`);

  } catch (err) {

    console.error(err);
    res.status(500).send("Error creating resume");

  }
};

exports.getEditor = async (req, res) => {

  try {

    if (!req.isAuthenticated()) {
      return res.redirect("/login");
    }

    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!resume) {
      return res.status(404).send("Resume not found");
    }

    resume.sections.sort((a, b) => a.order - b.order);

    res.render("resumeBuilder/editor", {
      resume,
      query:req.query
    });

  } catch (err) {

    console.error(err);
    res.status(500).send("Error loading editor");

  }
};
exports.getEditorSection = async (req,res)=>{

if(!req.isAuthenticated()){
return res.redirect("/login")
}

const resume = await Resume.findOne({
_id:req.params.id,
userId:req.user._id
})

const section = req.params.section

if(section === "basics"){
return res.render("resumeBuilder/editor/basics",{resume})
}

if(section === "summary"){
return res.render("resumeBuilder/editor/summary",{resume})
}

if(section === "skills"){
return res.render("resumeBuilder/editor/skills",{resume})
}

if(section === "experience"){
return res.render("resumeBuilder/editor/experience",{resume})
}

if(section === "projects"){
return res.render("resumeBuilder/editor/projects",{resume})
}

if(section === "education"){
return res.render("resumeBuilder/editor/education",{resume})
}

res.send("<h2>Unknown Section</h2>")

}


exports.renameResume = async (req,res)=>{
  await Resume.updateOne(
    { _id:req.params.id, userId:req.user._id },
    { title:req.body.title }
  )
  res.redirect("/builder")
}
exports.deleteResume = async (req,res)=>{
  await Resume.deleteOne({
    _id:req.params.id,
    userId:req.user._id
  })
  res.redirect("/builder")
}

// bascis info

exports.updateBasics = async (req, res) => {

  try {

    if (!req.isAuthenticated()) {
      return res.redirect("/login");
    }

    await Resume.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user._id
      },
      {
        basics: {
          fullName: req.body.fullName,
          email: req.body.email,
          phone: req.body.phone,
          location: req.body.location,
          links: [
            { label: "LinkedIn", url: req.body.linkedin || "" },
            { label: "GitHub", url: req.body.github || "" }
          ].filter(link => link.url.trim() !== "")
        }
      },
      { returnDocument: "after" }
    );

    res.redirect(`/builder/${req.params.id}/editor?section=summary`);
    

  } catch (err) {

    console.error(err);
    res.status(500).send("Error updating basics");

  }
};

//summary 

exports.updateSummary = async (req, res) => {

  try {

    if (!req.isAuthenticated()) {
      return res.redirect("/login");
    }

    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!resume) {
      return res.status(404).send("Resume not found");
    }

    const summarySection = resume.sections.find(
      section => section.title === "Summary"
    );

    summarySection.data = req.body.summary;

    resume.markModified("sections");

    await resume.save();

    res.redirect(`/builder/${req.params.id}/editor?section=skills`);

  } catch (err) {

    console.error(err);
    res.status(500).send("Error updating summary");

  }

};

//skills
exports.addSkillGroup = async (req, res) => {

  try {

    if (!req.isAuthenticated()) {
      return res.redirect("/login");
    }

    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    const skillsSection = resume.sections.find(
      section => section.title === "Skills"
    );

    skillsSection.data.push({
      group: req.body.groupName,
      items: []
    });

    resume.markModified("sections");

    await resume.save();

    res.redirect(`/builder/${req.params.id}/editor?section=skills`)

  } catch (err) {

    console.error(err);
    res.status(500).send("Error adding skill group");

  }

};
exports.updateSkillItems = async (req, res) => {

  try {

    if (!req.isAuthenticated()) {
      return res.redirect("/login");
    }

    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    const skillsSection = resume.sections.find(
      section => section.title === "Skills"
    );

    const index = parseInt(req.params.groupIndex);

    skillsSection.data[index].items = req.body.skills
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);

    resume.markModified("sections");

    await resume.save();

    res.redirect(`/builder/${req.params.id}/editor?section=skills`)

  } catch (err) {

    console.error(err);
    res.status(500).send("Error updating skills");

  }

};
exports.updateSkillGroupName = async (req,res)=>{

if(!req.isAuthenticated()){
return res.redirect("/login")
}

const resume = await Resume.findOne({
_id:req.params.id,
userId:req.user._id
})

const skillsSection = resume.sections.find(
section=>section.title==="Skills"
)

const index = parseInt(req.params.groupIndex)

skillsSection.data[index].group = req.body.groupName

resume.markModified("sections")

await resume.save()

res.redirect(`/builder/${req.params.id}/editor?section=skills`)

}
exports.deleteSkillGroup = async (req,res)=>{

if(!req.isAuthenticated()){
return res.redirect("/login")
}

const resume = await Resume.findOne({
_id:req.params.id,
userId:req.user._id
})

const skillsSection = resume.sections.find(
section=>section.title==="Skills"
)

const index = parseInt(req.params.groupIndex)

skillsSection.data.splice(index,1)

resume.markModified("sections")

await resume.save()

res.redirect(`/builder/${req.params.id}/editor?section=skills`)

}

//experience
const mongoose = require("mongoose")
exports.addExperience = async (req,res)=>{

try{

if(!req.isAuthenticated()){
return res.redirect("/login")
}

const resume = await Resume.findOne({
_id:req.params.id,
userId:req.user._id
})

const experienceSection = resume.sections.find(
section => section.title === "Experience"
)

experienceSection.data.push({

_id:new mongoose.Types.ObjectId(),

title:req.body.role,
subtitle:req.body.company,
location:req.body.location,
startDate:req.body.startDate,
endDate:req.body.endDate,

links:[],
bullets:[]

})

resume.markModified("sections")

await resume.save()

res.redirect(`/builder/${req.params.id}/editor?section=experience`)

}
catch(err){

console.error(err)
res.status(500).send("Error adding experience")

}

}
exports.addExperienceBullet = async (req,res)=>{

try{

if(!req.isAuthenticated()){
return res.redirect("/login")
}

const resume = await Resume.findOne({
_id:req.params.id,
userId:req.user._id
})

const experienceSection = resume.sections.find(
section => section.title === "Experience"
)

const entry = experienceSection.data.find(
e => e._id && e._id.toString() === req.params.expId
)

entry.bullets.push({

_id:new mongoose.Types.ObjectId(),

text:req.body.bullet,

isAIEnhanced:false,

hasMetric:/\d/.test(req.body.bullet)

})

resume.markModified("sections")

await resume.save()

res.redirect(`/builder/${req.params.id}/editor?section=experience`)

}
catch(err){

console.error(err)
res.status(500).send("Error adding bullet")

}

}
exports.updateExperience = async (req,res)=>{

try{

if(!req.isAuthenticated()){
return res.redirect("/login")
}

const resume = await Resume.findOne({
_id:req.params.id,
userId:req.user._id
})

const expSection = resume.sections.find(
s => s.title === "Experience"
)

const entry = expSection.data.find(
e => e._id && e._id.toString() === req.params.expId
)

entry.title = req.body.role
entry.subtitle = req.body.company
entry.location = req.body.location
entry.startDate = req.body.startDate
entry.endDate = req.body.endDate

resume.markModified("sections")

await resume.save()

res.redirect(`/builder/${req.params.id}/editor?section=experience`)

}
catch(err){
console.error(err)
res.status(500).send("Error updating experience")
}

}
exports.deleteExperience = async (req,res)=>{

try{

if(!req.isAuthenticated()){
return res.redirect("/login")
}

const resume = await Resume.findOne({
_id:req.params.id,
userId:req.user._id
})

const expSection = resume.sections.find(
s => s.title === "Experience"
)

expSection.data = expSection.data.filter(
e => e._id.toString() !== req.params.expId
)

resume.markModified("sections")

await resume.save()

res.redirect(`/builder/${req.params.id}/editor?section=experience`)

}
catch(err){
console.error(err)
res.status(500).send("Error deleting experience")
}

}
exports.deleteExperienceBullet = async (req,res)=>{

try{

if(!req.isAuthenticated()){
return res.redirect("/login")
}

const resume = await Resume.findOne({
_id:req.params.id,
userId:req.user._id
})

const expSection = resume.sections.find(
s => s.title === "Experience"
)

const entry = expSection.data.find(
e => e._id.toString() === req.params.expId
)

entry.bullets = entry.bullets.filter(
b => b._id.toString() !== req.params.bulletId
)

resume.markModified("sections")

await resume.save()

res.redirect(`/builder/${req.params.id}/editor?section=experience`)

}
catch(err){
console.error(err)
res.status(500).send("Error deleting bullet")
}

}
exports.updateExperienceBullet = async (req,res)=>{

try{

if(!req.isAuthenticated()){
return res.redirect("/login")
}

const resume = await Resume.findOne({
_id:req.params.id,
userId:req.user._id
})

const expSection = resume.sections.find(
s => s.title === "Experience"
)

const entry = expSection.data.find(
e => e._id.toString() === req.params.expId
)

const bullet = entry.bullets.find(
b => b._id.toString() === req.params.bulletId
)

bullet.text = req.body.bullet
bullet.hasMetric = /\d/.test(req.body.bullet)

resume.markModified("sections")

await resume.save()

res.redirect(`/builder/${req.params.id}/editor?section=experience`)

}
catch(err){
console.error(err)
res.status(500).send("Error updating bullet")
}

}

//projects

exports.addProject = async (req,res)=>{

try{

if(!req.isAuthenticated()){
return res.redirect("/login")
}

const resume = await Resume.findOne({
_id:req.params.id,
userId:req.user._id
})

const projectSection = resume.sections.find(
section => section.title === "Projects"
)

projectSection.data.push({

_id:new mongoose.Types.ObjectId(),

title:req.body.title,
subtitle:req.body.tech,
location:"",
startDate:"",
endDate:"",

links:[],
bullets:[]

})

resume.markModified("sections")

await resume.save()

res.redirect(`/builder/${req.params.id}/editor?section=projects`)

}
catch(err){

console.error(err)
res.status(500).send("Error adding project")

}

}
exports.updateProject = async (req,res)=>{

try{

if(!req.isAuthenticated()){
return res.redirect("/login")
}

const resume = await Resume.findOne({
_id:req.params.id,
userId:req.user._id
})

const projectSection = resume.sections.find(
section => section.title === "Projects"
)

const entry = projectSection.data.find(
e => e._id.toString() === req.params.projectId
)

entry.title = req.body.title
entry.subtitle = req.body.tech

resume.markModified("sections")

await resume.save()

res.redirect(`/builder/${req.params.id}/editor?section=projects`)

}
catch(err){

console.error(err)
res.status(500).send("Error updating project")

}

}
exports.deleteProject = async (req,res)=>{

try{

if(!req.isAuthenticated()){
return res.redirect("/login")
}

const resume = await Resume.findOne({
_id:req.params.id,
userId:req.user._id
})

const projectSection = resume.sections.find(
section => section.title === "Projects"
)

projectSection.data = projectSection.data.filter(
p => p._id.toString() !== req.params.projectId
)

resume.markModified("sections")

await resume.save()

res.redirect(`/builder/${req.params.id}/editor?section=projects`)

}
catch(err){

console.error(err)
res.status(500).send("Error deleting project")

}

}
exports.addProjectBullet = async (req,res)=>{

try{

if(!req.isAuthenticated()){
return res.redirect("/login")
}

const resume = await Resume.findOne({
_id:req.params.id,
userId:req.user._id
})

const projectSection = resume.sections.find(
section => section.title === "Projects"
)

const entry = projectSection.data.find(
e => e._id.toString() === req.params.projectId
)

entry.bullets.push({

_id:new mongoose.Types.ObjectId(),

text:req.body.bullet,

isAIEnhanced:false,

hasMetric:/\d/.test(req.body.bullet)

})

resume.markModified("sections")

await resume.save()

res.redirect(`/builder/${req.params.id}/editor?section=projects`)

}
catch(err){

console.error(err)
res.status(500).send("Error adding project bullet")

}

}
exports.updateProjectBullet = async (req,res)=>{

try{

if(!req.isAuthenticated()){
return res.redirect("/login")
}

const resume = await Resume.findOne({
_id:req.params.id,
userId:req.user._id
})

const projectSection = resume.sections.find(
section => section.title === "Projects"
)

const entry = projectSection.data.find(
p => p._id.toString() === req.params.projectId
)

const bullet = entry.bullets.find(
b => b._id.toString() === req.params.bulletId
)

bullet.text = req.body.bullet
bullet.hasMetric = /\d/.test(req.body.bullet)

resume.markModified("sections")

await resume.save()

res.redirect(`/builder/${req.params.id}/editor?section=projects`)

}
catch(err){

console.error(err)
res.status(500).send("Error updating project bullet")

}

}
exports.deleteProjectBullet = async (req,res)=>{

try{

if(!req.isAuthenticated()){
return res.redirect("/login")
}

const resume = await Resume.findOne({
_id:req.params.id,
userId:req.user._id
})

const projectSection = resume.sections.find(
section => section.title === "Projects"
)

const entry = projectSection.data.find(
p => p._id.toString() === req.params.projectId
)

entry.bullets = entry.bullets.filter(
b => b._id.toString() !== req.params.bulletId
)

resume.markModified("sections")

await resume.save()

res.redirect(`/builder/${req.params.id}/editor?section=projects`)

}
catch(err){

console.error(err)
res.status(500).send("Error deleting project bullet")

}

}

exports.addEducation = async (req,res)=>{

try{

if(!req.isAuthenticated()){
return res.redirect("/login")
}

const resume = await Resume.findOne({
_id:req.params.id,
userId:req.user._id
})

const eduSection = resume.sections.find(
section => section.title === "Education"
)

eduSection.data.push({

_id:new mongoose.Types.ObjectId(),

title:req.body.degree,
subtitle:req.body.institution,
location:req.body.location,
startDate:req.body.startDate,
endDate:req.body.endDate,

links:[],
bullets:[]

})

resume.markModified("sections")

await resume.save()

res.redirect(`/builder/${req.params.id}/editor?section=education`)

}
catch(err){

console.error(err)
res.status(500).send("Error adding education")

}

}
exports.updateEducation = async (req,res)=>{

try{

if(!req.isAuthenticated()){
return res.redirect("/login")
}

const resume = await Resume.findOne({
_id:req.params.id,
userId:req.user._id
})

const eduSection = resume.sections.find(
section => section.title === "Education"
)

const entry = eduSection.data.find(
e => e._id.toString() === req.params.eduId
)

entry.title = req.body.degree
entry.subtitle = req.body.institution
entry.location = req.body.location
entry.startDate = req.body.startDate
entry.endDate = req.body.endDate

resume.markModified("sections")

await resume.save()

res.redirect(`/builder/${req.params.id}/editor?section=education`)

}
catch(err){

console.error(err)
res.status(500).send("Error updating education")

}

}
exports.deleteEducation = async (req,res)=>{

try{

if(!req.isAuthenticated()){
return res.redirect("/login")
}

const resume = await Resume.findOne({
_id:req.params.id,
userId:req.user._id
})

const eduSection = resume.sections.find(
section => section.title === "Education"
)

eduSection.data = eduSection.data.filter(
e => e._id.toString() !== req.params.eduId
)

resume.markModified("sections")

await resume.save()

res.redirect(`/builder/${req.params.id}/editor?section=education`)

}
catch(err){

console.error(err)
res.status(500).send("Error deleting education")

}

}


exports.printResume = async (req, res) => {


  try {
    if (!req.isAuthenticated()) {
      return res.redirect("/login");
    }

    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    // ✅ FIX 1: check early
    if (!resume) {
      return res.send("Resume not found");
    }

    let finalResume = resume;

    if (req.query.mode === "ai" && resume.aiCache?.optimizedResume) {
      finalResume = resume.aiCache.optimizedResume;
    }

    // ✅ FIX 2: sort correct object
    if (finalResume.sections) {
      finalResume.sections.sort((a, b) => a.order - b.order);
    }

   const browser = await puppeteer.launch({
  headless: "new",
  executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || "/usr/bin/chromium-browser",
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-gpu"
  ]
});

    const page = await browser.newPage();

    const html = await ejs.renderFile(
      path.join(__dirname, "../views/resumeBuilder/print.ejs"),
      { resume: finalResume }
    );

    await page.setContent(html, {
      waitUntil: "domcontentloaded",
      timeout: 30000 // ✅ prevent hanging
    });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "40px",
        bottom: "40px",
        left: "40px",
        right: "40px"
      }
    });

    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=resume.pdf"
    });

    res.send(pdfBuffer);

  } catch (err) {
    console.error("PDF Error:", err);

    // ✅ FIX 3: always close browser
    if (browser) await browser.close();

    res.status(500).send("Error generating PDF");
  }
};

exports.enhanceResumeAI = async (req, res) => {

try {

if (!req.isAuthenticated || !req.isAuthenticated()) {
return res.redirect("/login")
}

const resume = await Resume.findOne({
_id: req.params.id,
userId: req.user._id
})

if (!resume) {
return res.status(404).send("Resume not found")
}

resume.sections.sort((a,b)=>a.order-b.order)

const aiResult = await enhanceResume(resume)

/* 🔥 SAVE AI RESULT */

 await Resume.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user._id
      },
      {
        aiCache: {
          optimizedResume: aiResult.optimizedResume,
          atsScoreBefore: aiResult.atsScoreBefore,
          atsScoreAfter: aiResult.atsScoreAfter,
          missingSkills: aiResult.missingSkills,
          improvementNotes: aiResult.improvementNotes,
          lastGenerated: new Date()
        }
      }
);
res.json(aiResult)

} catch(err) {

console.error(err)
res.status(500).send("AI enhancement failed")

}

}

exports.enhanceResumeWithJD = async (req,res)=>{

    try{

    const resume = await Resume.findOne({
    _id: req.params.id,
    userId: req.user._id
    })

    if(!resume) return res.status(404).send("Not found")

    const jd = req.body.jd
    const result = await enhanceResumeWithJD(resume, jd)

    // optional: store in DB
    resume.aiCache = result
    resume.status = "optimized"
    await resume.save()

    res.json(result)

    }catch(err){
    res.status(500).json({ error: err.message })
    }

}


const { extractText } = require("../services/parser/textExtractor")
const { normalizeResume } = require("../utils/normalizeResume")

exports.importResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send("No file uploaded");
        }

        // req.file.buffer is available because multer memoryStorage is used in the route
        const text = await extractText(req.file.buffer, req.file.mimetype);

        const parsed = await parseResumeFromText(text);
        const normalized = normalizeResume(parsed);

        const newResume = await Resume.create({
            userId: req.user._id,
            title: normalized.basics.fullName || "Imported Resume",
            basics: normalized.basics,
            sections: normalized.sections,
            status: "draft"
        });

        res.redirect(`/builder/${newResume._id}/editor`);

    } catch (err) {
        console.error(err);
        res.status(500).send("Import failed");
    }
};