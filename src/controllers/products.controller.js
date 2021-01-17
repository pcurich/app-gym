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
      const newProduct = new Product({ name, price, description, duration, sequence});
      newProduct.createdBy = req.user.id;
      newProduct.updatedBy = req.user.id;
      newProduct.deleted = false;
      
      if (!state) {
        newProduct.state = false;  
      }else{
        newProduct.state = true;          
      }

      await newProduct.save();
      req.flash("success_msg", "Plan creado satisfactoriamente");
      res.redirect("/products");  
    } catch (error) {
      req.flash("error_msg", JSON.stringify(error));
      res.redirect("/products");  
    }
  }  
}

ctrl.renderProducts = async (req, res) => {
  const products = await Product.find({deleted:"false"}).lean();
  res.render("products/all-products", { products });
}

ctrl.renderEditForm = async (req, res) => {
  const product = await Product.findById(req.params.id).lean();
  res.render("products/edit-product", { product });
};

ctrl.updateProduct = async (req, res) => {
  const { name, price, description, duration,sequence,state } = req.body
  if(!state){
    await Product.findByIdAndUpdate(req.params.id, { 
      name, price, description, duration,sequence,state:false
    });
  }else{
    await Product.findByIdAndUpdate(req.params.id, { 
      name, price, description, duration,sequence,state:true
    });
  }
  
  req.flash("success_msg", "Producto actualizado satisfactoriamente");
  res.redirect("/products");
};

module.exports = ctrl;