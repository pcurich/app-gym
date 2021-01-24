const express = require("express");
const router = express.Router();

const {
  renderCustomerHistoryForm,
  renderCustomerCheckForm,
  renderCustomerHistory,
  renderCustomerCheck
} = require("../controllers/queries.controller");

const { isAuthenticated } = require("../helpers/auth");


router.get("/queries/history", isAuthenticated, renderCustomerHistoryForm);
router.get("/queries/check", isAuthenticated, renderCustomerCheckForm);

router.post("/queries/history", isAuthenticated, renderCustomerHistory);
router.post("/queries/check", isAuthenticated, renderCustomerCheck);

module.exports = router;