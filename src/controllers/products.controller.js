const ctrl = {};

// Models
const Product = require("../models/Product");

ctrl.renderProductForm = (req, res) => {
  res.render("products/new-product");
};

ctrl.createNewProduct = async (req, res) => {
  const { name, price, description, duration,sequence,state } = req.body
  const errors = [];
  if (!name) {
    errors.push({ text: "Ingrese el nombre del Plan." });
  }
  if (!price || price == 0) {
    errors.push({ text: "El precio debe ser mayor a cero" });
  }
  if (!duration || duration == 0 ) {
    errors.push({ text: "La duración debe ser mayor a cero" });
  }
  if (errors.length > 0) {
    res.render("products/new-product", {
      errors,
      price,
      description,
      duration,
      sequence
    });
  }else {
    try { 
      const newProduct = new Product({ name, price, description, duration, sequence, createdBy: req.user.id, updatedBy: req.user.id, deleted: false });
      if(state){
        newProduct.state = true;
      }else{
        newProduct.state = false;
      }
      await newProduct.save();
      req.flash("success_msg", "Plan actualizado satisfactoriamente");
      res.redirect("/products");  
    } catch (error) {
      req.flash("error_msg", JSON.stringify(error));
      res.redirect("/products");  
    }
  }  
}

ctrl.renderProducts = async (req, res) => {
  const products = await Product.find({deleted:false}).lean();
  res.render("products/all-products", { products });
}

ctrl.renderEditForm = async (req, res) => {
  const product = await Product.findById(req.params.id).lean();
  res.render("products/edit-product", { product });
};

ctrl.updateProduct = async (req, res) => {
  const { name, price, description, duration,sequence,state } = req.body
  console.log(req.body);
  if(!state){
    await Product.findByIdAndUpdate(req.params.id, { 
      name, price, description, duration,sequence,state:false
    });
  }else{
    await Product.findByIdAndUpdate(req.params.id, { 
      name, price, description, duration,sequence,state:true
    });
  }
  
  req.flash("success_msg", "Plan actualizado satisfactoriamente");
  res.redirect("/products");
};

ctrl.deleteProduct = async (req, res) => {
  console.log(req.params.id);
  await Product.findByIdAndUpdate(req.params.id, { 
    deleted:true
  });
  req.flash("success_msg", "Plan borrado satisfactoriamente");
  res.redirect("/products");
};

module.exports = ctrl;