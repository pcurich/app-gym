const express = require("express");
const router = express.Router();

// Controller
const {
  renderCustomerForm,
  renderNoteCustomerForm,
  createNewCustomer,
  createNewPayment,
  createNewNote,
  renderCustomers,
  renderSearchCustomer,
  renderEditForm,
  renderNoteEditForm,
  updateCustomer,
  updateNote,
  cancelPlanCustomer,
  paymentCustomer,
  deleteCustomer,
  deleteNote,
  notesCustomer
} = require("../controllers/customers.controller");

// Helpers
const { isAuthenticated } = require("../helpers/auth");

// New 
router.get("/customers/add", isAuthenticated, renderCustomerForm);
router.post("/customers/new-customer", isAuthenticated, createNewCustomer);
router.post("/customers/addPayment", isAuthenticated, createNewPayment);
router.post("/customers/new-note-customer", isAuthenticated, createNewNote);

// // Edit
router.get("/customers/edit-customer/:id", isAuthenticated, renderEditForm);
router.put("/customers/edit-customer/:id", isAuthenticated, updateCustomer);
router.get("/customers/cancel/:customerId/:productId", isAuthenticated, cancelPlanCustomer);
router.get("/customers/payments/:customerId/:productId", isAuthenticated, paymentCustomer);
router.get("/customers/notes/:customerId", isAuthenticated, notesCustomer);
router.get("/customers/add-note/:customerId", isAuthenticated, renderNoteCustomerForm);
router.get("/customers/edit-note/:noteId",isAuthenticated, renderNoteEditForm);
router.put("/customers/edit-note/:noteId",isAuthenticated, updateNote);
//Delete
router.delete("/customers/delete/:id", isAuthenticated, deleteCustomer);
router.delete("/customers/delete-note/:noteId", isAuthenticated, deleteNote);

// Get all
router.get("/customers", isAuthenticated, renderCustomers); 

// Search
router.get("/customers/search/:letter", isAuthenticated, renderSearchCustomer);
router.post("/customers/search", isAuthenticated, renderSearchCustomer);

module.exports = router;