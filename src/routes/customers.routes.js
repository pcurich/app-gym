const express = require("express");
const router = express.Router();

// Controller
const {
  renderCustomerForm,
  createNewCustomer,
  renderCustomers,
  renderEditForm
  
} = require("../controllers/customers.controller");

// Helpers
const { isAuthenticated } = require("../helpers/auth");

// New Note
router.get("/customers/add", isAuthenticated, renderCustomerForm);
router.post("/customers/new-customer", isAuthenticated, createNewCustomer);


// // Edit Notes
router.get("/customers/edit/:id", isAuthenticated, renderEditForm);

// router.put("/customers/edit-note/:id", isAuthenticated, updateNote);


// // Delete Notes
// router.delete("/customers/delete/:id", isAuthenticated, deleteNote);


// Get All Notes
router.get("/customers", isAuthenticated, renderCustomers); 

// Search by name
router.get("/customers/:letter", isAuthenticated, renderCustomers);
router.get("/customers/:letter/:type", isAuthenticated, renderCustomers);

module.exports = router;