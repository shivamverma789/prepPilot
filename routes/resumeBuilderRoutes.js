const express = require("express");
const router = express.Router();

const controller = require("../controllers/resumeBuilderController");

router.get("/", controller.getDashboard)
router.get("/create", controller.createResume);
router.get("/:id/editor", controller.getEditor);
router.get("/:id/editor-section/:section",controller.getEditorSection)
router.post("/:id/rename", controller.renameResume)
router.post("/:id/delete", controller.deleteResume)

router.post("/:id/basics", controller.updateBasics);

router.post("/:id/summary", controller.updateSummary);

router.post("/:id/skills/group", controller.addSkillGroup);
router.post("/:id/skills/:groupIndex", controller.updateSkillItems);
router.post("/:id/skills/:groupIndex/name",controller.updateSkillGroupName);
router.post("/:id/skills/:groupIndex/delete",controller.deleteSkillGroup);

router.post("/:id/experience",controller.addExperience);
router.post("/:id/experience/:expId/bullet",controller.addExperienceBullet);
router.post("/:id/experience/:expId/update",controller.updateExperience);
router.post("/:id/experience/:expId/delete",controller.deleteExperience);
router.post("/:id/experience/:expId/bullet/:bulletId/delete",controller.deleteExperienceBullet);
router.post("/:id/experience/:expId/bullet/:bulletId/update",controller.updateExperienceBullet);

router.post("/:id/projects",controller.addProject);
router.post("/:id/projects/:projectId/update",controller.updateProject);
router.post("/:id/projects/:projectId/delete",controller.deleteProject);
router.post("/:id/projects/:projectId/bullet",controller.addProjectBullet);
router.post("/:id/projects/:projectId/bullet/:bulletId/update",controller.updateProjectBullet);
router.post("/:id/projects/:projectId/bullet/:bulletId/delete",controller.deleteProjectBullet);

router.post("/:id/education",controller.addEducation);
router.post("/:id/education/:eduId/update",controller.updateEducation);
router.post("/:id/education/:eduId/delete",controller.deleteEducation);


router.get("/:id/print", controller.printResume);


router.post("/:id/ai-enhance", controller.enhanceResumeAI)
router.post("/:id/ai-enhance-jd", controller.enhanceResumeWithJD)

// Import resume from file — use memoryStorage so no disk writes (safe on Render)
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/import",
  upload.single("resume"),
  controller.importResume
)

module.exports = router;