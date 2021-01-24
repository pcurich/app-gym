const ctrl = {};

// Models
const Customer = require("../models/Customer");
const History = require("../models/History");
const Assistance = require("../models/Assistance")
const moment = require("moment");
var ObjectId = require('mongodb').ObjectID

ctrl.renderCustomerHistoryForm = async (req,res) => {
  res.render('queries/customer-history', { nextStep:'history' });
}

ctrl.renderCustomerCheckForm = async (req,res) => {
  res.render('queries/customer-check', { nextStep:'check' });
}

ctrl.renderCustomerHistory = async (req, res) => {

  if(req.body.dni){
    const customer = await Customer.findOne({ dni: req.body.dni, deleted :false}).lean();
    if (customer){
      const history = await History.find({customerId: customer._id}).populate('productId').sort({ updatedAt: "desc" }).lean();
      customer.history = history;
      res.render("queries/customer-history", {customerId:customer._id, customer, nextStep:'history' });
    }else{
      req.flash("error_msg", "El Dni ingresado no se encuentra registrado");
      res.redirect("/queries/history");
    }
  }else{
    req.flash("error_msg", "Ingrese un Dni para consultar");
    res.redirect("/queries/history");
  }  
};

ctrl.renderCustomerCheck = async (req, res) => {
  const { dni } = req.body;
  if(dni && dni!="" ){    
    try {
      console.log("antes");
      const customer = await Customer.findOne( { dni, deleted: false}).populate("currentProduct").lean();
      console.log("customer="+customer);
      if (customer){
        const assistance = new Assistance({ 
          productId: ObjectId(customer.currentProduct._id), customerId: ObjectId(customer._id),
          createdBy: ObjectId(req.user.id), updatedBy: ObjectId(req.user.id), entryDate: new Date()
        });
        assistance.save();
        console.log(assistance);
        var groupAsisitence = [];
        var tmp = []
        var asistence = await Assistance.find({  productId: ObjectId(customer.currentProduct._id), customerId: ObjectId(customer._id)}).sort({ entryDate: "desc" }).lean();

        asistence.forEach(e => {
          tmp.push(moment(e.entryDate).format('YYYY-MM'))
        });
        tmp = unique(tmp);

        tmp.forEach(x=>{
          var t = [];
          asistence.forEach(e => {
            if (x == moment(e.entryDate).format('YYYY-MM')){
              t.push(e.entryDate)
            }
          });
          groupAsisitence.push({group:x, list:t, length: t.length })
        })
        
        customer.asistence=groupAsisitence
        req.flash("success_msg", "Asistencia registrada");
        customer.dni = "";       
        res.render("queries/customer-check", { customer, nextStep:'check' });
      }else{
        req.flash("error_msg", "El Dni ingresado no se encuentra registrado");
        res.redirect("/queries/check");
      }
    } catch (error) {
      console.log(error);
      req.flash("error_msg", JSON.stringify(error));
      res.redirect("/queries/check");
    }
  }
  else{
    req.flash("error_msg", "Ingrese un Dni para consultar");
    res.redirect("/queries/check");
  }
};

unique = (arr) => {
    var u = {}, a = [];
    for(var i = 0, l = arr.length; i < l; ++i){
        if(!u.hasOwnProperty(arr[i])) {
            a.push(arr[i]);
            u[arr[i]] = 1;
        }
    }
    return a;
}

module.exports = ctrl;