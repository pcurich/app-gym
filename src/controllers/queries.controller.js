const ctrl = {};

// Models
const Customer = require("../models/Customer");
const History = require("../models/History");
const Assistance = require("../models/Assistance")
const moment = require("moment");
var ObjectId = require('mongodb').ObjectID;
const Payment = require("../models/Payment");
const { populate } = require("../models/Customer");

ctrl.renderCustomerHistoryForm =  (req,res) => {
  res.render('queries/customer-history', { nextStep:'history' });
}

ctrl.renderCustomerCheckForm =  (req,res) => {
  res.render('queries/customer-check', { nextStep:'check' });
}

ctrl.renderPaymentsForm =  (req, res) => {
  res.render('queries/payments');
}

ctrl.renderPayments = async (req, res) => {
  const {from, to} = req.body;
  console.log({'from':(new Date(from)).toISOString(),'to':(new Date(to)).toISOString()});
  const payments = await Payment.find({
    createdAt: {
      $gt: (new Date(from)).toISOString(),
      $lt: (new Date(to)).toISOString()
  }
  }).populate("productId").populate("customerId").populate("createdBy").sort({ createdAt: "desc" }).lean();
  if (payments){
    var cash = 0.0;
    var credit = 0.0;
    var other = 0.0;
    await payments.forEach(e=>{
      if(e.type == "Efectivo"){
        cash = cash + e.amountPayed*1.0;
      }
      if(e.type == "Tarjeta"){
        credit = credit + e.amountPayed*1.0;
      }
      if(e.type == "Otro"){
        other = other + e.amountPayed*1.0;
      }
    });
    var total = cash +credit + other;
    res.render('queries/payments', {payments, cash, credit, other, total });
  }else{
    res.render('queries/payments', {payments:undefined});
  }  
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

ctrl.renderCustomerCheckIn = async (req, res) => {
  const { customerId, productId } = req.params;

  const assistance = new Assistance({ 
    productId: ObjectId(productId), customerId: ObjectId(customerId),
    createdBy: ObjectId(req.user.id), updatedBy: ObjectId(req.user.id), entryDate: new Date()
  });
  assistance.save();
  req.flash("success_msg", "Asistencia registrada");   
  res.redirect("/queries/check");
} 

ctrl.renderCustomerCheck = async (req, res) => {
  const { dni } = req.body;
  if(dni && dni!="" ){    
    try {
      const customer = await Customer.findOne( { dni, deleted: false}).populate("currentProduct").lean();
      if (customer){
        if(customer.currentProduct){
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
          req.flash("error_msg", "El socio no cuenta con un plan activo");
          res.redirect("/queries/check");
        }
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