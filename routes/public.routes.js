const { Router } = require("express");
const { check } = require("express-validator");
const { validateFields } = require("../middlewares");

const router = Router();

const {
  findDays,
  findOneDay,
  findEvents,
  findOneEvent,
  findCategoryEvents,
  findArticles,
  findOneArticle,
  findOcio,
  findOneOcio,
  findOcioCategory,
  getSettings,
  findGaiatas,
  setVote,
  getVote,
  findArticlesPaths,
  findEventsPaths,
  findOneGaiata,
} = require("../controllers/public");

router.get("/days", findDays);
router.get("/days/:id", findOneDay);
router.get("/days/:id/events", findEvents);
router.get("/event/:id", findOneEvent);
router.get("/events/path", findEventsPaths);
router.get("/category/:slug/events", findCategoryEvents);
router.get("/articles", findArticles);
router.get("/article/:id", findOneArticle);
router.get("/articles/path", findArticlesPaths);
router.get("/ocio", findOcio);
router.get("/ocio/category/:id", findOcioCategory);
router.get("/ocio/:id", findOneOcio);
router.get("/settings", getSettings);
router.get("/gaiatas", findGaiatas);
router.get("/gaiata/:id", findOneGaiata);
router.get("/vote/:type/:idUser/:idVoted", getVote);
router.get("/vote/:type/:idUser", getVote);

const validations = [
  check("value", "El value es requerido.").not().isEmpty(),
  validateFields,
];
router.post("/vote/:type/:idUser/:idVoted", validations, setVote);

module.exports = router;
