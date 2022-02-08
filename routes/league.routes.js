const { Router } = require("express");
const router = Router();

const { overall } = require("../controllers/league");

router.get("/:id/overall", overall);

module.exports = router;
