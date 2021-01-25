const express = require("express");
const router = express.Router();

const {
  renderCustomerHistoryForm,
  renderCustomerCheckForm,
  renderCustomerHistory,
  renderCustomerCheck,
  renderCustomerCheckIn,
  renderPaymentsForm
} = require("../controllers/queries.controller");

const { isAuthenticated } = require("../helpers/auth");


router.get("/queries/history", isAuthenticated, renderCustomerHistoryForm);
router.get("/queries/check", isAuthenticated, renderCustomerCheckForm);
router.get("/queries/check-in/:customerId/:productId", isAuthenticated, renderCustomerCheckIn);

router.post("/queries/history", isAuthenticated, renderCustomerHistory);
router.post("/queries/check", isAuthenticated, renderCustomerCheck);

router.get("/queries/payments" , isAuthenticated, renderPaymentsForm);

module.exports = router;