const { Router } = require("express");
const { check } = require("express-validator");

const { validateFields, validateFile } = require("../middlewares");
const { update, removeFile } = require("../controllers/uploads");
const { allowedCollections } = require("../helpers");

const router = Router();

router.put(
  "/:collection/:id",
  [
    validateFile,
    check("id", "El id debe de ser de mongo").isMongoId(),
    check("collection").custom((c) =>
      allowedCollections(c, [
        "days",
        "event",
        "categories",
        "blog",
        "locations",
        "ocio",
        "gaiatas",
      ])
    ),
    validateFields,
  ],
  update
);

router.delete(
  "/:collection/:id",
  [
    check("id", "El id debe de ser de mongo").isMongoId(),
    check("collection").custom((c) =>
      allowedCollections(c, [
        "days",
        "event",
        "categories",
        "blog",
        "locations",
        "ocio",
        "gaiatas",
      ])
    ),
    validateFields,
  ],
  removeFile
);

module.exports = router;
