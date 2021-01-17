const customersCtrl = {};

// Models
const Customer = require("../models/Customer");
const Product = require("../models/Product");

customersCtrl.renderCustomerForm = (req, res) => {
  res.render("customers/new-customer");
};

customersCtrl.createNewCustomer = async (req, res) => {
  const { name, lastName, dni, email } = req.body;
  const errors = [];
  if (!name) {
    errors.push({ text: "Ingrese el nombre del asociado." });
  }
  if (!lastName) {
    errors.push({ text: "Ingrese el apellido del asociado." });
  }
  if (!dni) {
    errors.push({ text: "Ingrese el dni del asociado." });
  } 
  if (errors.length > 0) {
    res.render("customers/new-customer", {
      errors,
      name,
      lastName,
      dni,
      email
    });
  } else {
    try {
      const newCustomer = new Customer({ name, lastName, dni, email });
      newCustomer.createdBy = req.user.id;
      newCustomer.updatedBy = req.user.id;
      newCustomer.registerDate =  new Date();
      newCustomer.state = true;
      newCustomer.deleted = false;
      await newCustomer.save();
      req.flash("success_msg", "Asociado creado satisfactoriamente");
      res.redirect("/customers");  
    } catch (error) {
      console.log(JSON.stringify(error));
      req.flash("error_msg", JSON.stringify(error));
      res.redirect("/customers");  
    }
  }
}

customersCtrl.renderCustomers = async (req, res) => {
  const { letter, type } = req.params;
  
  if (letter || type){
    if (letter && type == "w"){
      const customers = await Customer.find(
        { 
          name:  { $regex: new RegExp("^" + req.params.letter, "i") } ,
          currentProduct: { $exists: true }
        }
      ).sort({ registerDate: "desc" }).lean();
      res.render("customers/all-customers-with-product", { customers });
    }
    if (letter || type == "wo"){
      const customers = await Customer.find(
        { 
          name:  { $regex: new RegExp("^" + req.params.letter, "i") },
          currentProduct: { $exists: false }
        }
      ).sort({ registerDate: "desc" }).lean();
      res.render("customers/all-customers-without-product", { customers });
    }else{
      res.render("customers/all-customers");  
    }
  }else{
    res.render("customers/all-customers");  
  }
};

customersCtrl.renderEditForm = async (req, res) => {
  console.log(req.params.id);
  const customer = await Customer.findById(req.params.id).lean();
  customer.products = await Product.find({state:true}).lean()
  console.log(customer);
  res.render("customers/edit-customer", { customer });
};

module.exports = customersCtrl;