const ctrl = {};

// Models
const Customer = require("../models/Customer");
const Product = require("../models/Product");
const History = require("../models/History");
const Payment = require("../models/Payment");
const Note = require("../models/Note");
const moment = require("moment");
var ObjectId = require('mongodb').ObjectID

ctrl.renderCustomerForm = async (req, res) => {
  var products = await Product.find({state:true, deleted:false}).lean();
  products.unshift({_id:0,name:"------"});
  res.render("customers/new-customer",{products});
};

ctrl.renderNoteCustomerForm = async (req, res) => {
  const {customerId} = req.params;
  res.render("customers/new-note-customer",{customerId});
};

ctrl.createNewCustomer = async (req, res) => {
  const { name, lastName, dni, email, address, phone, currentProduct, startDate,state } = req.body;
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
    res.render("customers/new-customer", { errors, name, lastName, dni, email, address, phone });
  } else {
    try {
      const newCustomer = new Customer({ name, lastName, dni, email, address, phone, createdBy: ObjectId(req.user.id), updatedBy: ObjectId(req.user.id), registerDate: new Date(), deleted: false});
      if(state){
        newCustomer.state = true;
      }else{
        newCustomer.state = false;
      }

      if (currentProduct!='0') {
        
        var p = await Product.findOne({_id:currentProduct}).lean();
        var endDate =  getEndDate(startDate,p.sequence, p.duration);
        newCustomer.currentProduct = ObjectId(currentProduct);   
        newCustomer.startDate = startDate;
        newCustomer.endDate =  endDate;
        var nDaysTotal = moment(endDate).diff(moment(startDate),'days')
        newCustomer.nDaysTotal = nDaysTotal;
        newCustomer.nDaysLeft = nDaysTotal;
        newCustomer.nDaysTaked = 0;
        newCustomer.nDaysFreezing = 0;
        newCustomer.amountTotal = p.price;
        newCustomer.amountPayed = 0;
        await newCustomer.save();
        const newHistory = new History (
          { 
            productId: ObjectId(p._id), customerId: ObjectId(newCustomer._id), 
            createdBy: ObjectId(req.user.id), updatedBy: ObjectId(req.user.id), 
            registerDate: new Date(), startDate, endDate, nDaysTotal, nDaysTaked: 0, 
            nDaysLeft: nDaysTotal, nDaysFreezing: 0,state:true, cancelDate: undefined
          }
        );
        await newHistory.save();
      }else{
        newCustomer.currentProduct = undefined;
        newCustomer.startDate = undefined;
        newCustomer.endDate = undefined;
        newCustomer.nDaysTotal = 0;
        newCustomer.nDaysLeft = 0;
        newCustomer.nDaysTotal = 0;
        newCustomer.nDaysTotal = 0;
        newCustomer.amountTotal = 0;
        newCustomer.amountPayed = 0;
        await newCustomer.save();
      }

      req.flash("success_msg", "Socio creado satisfactoriamente");
      res.redirect("/customers");  
    } catch (error) {
      console.log("Error:" + JSON.stringify(error));
      req.flash("error_msg", JSON.stringify(error));
      res.redirect("/customers");  
    }
  }
}

ctrl.renderCustomers = async (req, res) => {
  const customers = await Customer.find({ deleted:  false }).populate('currentProduct').sort({ registerDate: "desc" }).lean();
  res.render("customers/all-customers", { customers });
};

ctrl.renderSearchCustomer = async (req, res) => {
  const { dni, type } = req.body;
  const { letter } = req.params;

  if (letter){
    const customers = await Customer.find(
      { 
        name:  { $regex: new RegExp("^" + letter, "i") },
        deleted:false
      }
    ).populate('currentProduct').sort({ registerDate: "desc" }).lean();
    res.render("customers/all-customers", { customers });
  }
  else{
    if (dni.length == 0 && type.length == 0) {
      const customers = await Customer.find( { deleted: false } ).populate('currentProduct').sort({ registerDate: "desc" }).lean();
      res.render("customers/all-customers", { customers });
    }
  
    if (dni.length > 0 && type.length == 0 ) {
      const customers = await Customer.find( { deleted: false, dni } ).populate('currentProduct').sort({ registerDate: "desc" }).lean();
      res.render("customers/all-customers", { customers });
    }
  
    if (dni.length == 0 && type.length > 0 && type == "w") {
      const customers = await Customer.find(
        { 
          currentProduct: { $exists: true },
          deleted: false
        }
      ).populate('currentProduct').sort({ registerDate: "desc" }).lean();
      res.render("customers/all-customers", { customers });
    }
  
    if (dni.length == 0 && type.length > 0 && type == "wo") {
      const customers = await Customer.find(
        { 
          currentProduct: { $exists: false },
          deleted: false
        }
      ).populate('currentProduct').sort({ registerDate: "desc" }).lean();
      res.render("customers/all-customers", { customers });
    }
  }
}

ctrl.renderEditForm = async (req, res) => {
  const customer = await Customer.findById(req.params.id).populate('createdBy').populate('updatedBy').lean();
  
  if (customer.currentProduct){
    customer.currentProduct = await Product.findById(customer.currentProduct).lean()
  }

  customer.products = await Product.find({ state:true, deleted:false}).lean();
  var products = []
  customer.products.forEach( e => {
    if ((e._id+"") == (customer.currentProduct+"")) {
      products.push({ _id: e._id, name:e.name, selected: true});
    }else{
      products.push({ _id: e._id, name:e.name});
    }
  });
  products.unshift({_id:0,name:"------"});
  customer.products = products;
  res.render("customers/edit  -customer", { customer });
};

ctrl.renderNoteEditForm =  async (req, res) => {
  const note = await Note.findById(req.params.noteId).lean();
  res.render("customers/edit-note-customer", { note });
}

ctrl.notesCustomer = async (req, res) => {
  const {customerId} = req.params;
  const notes = await Note.find({customerId,createdBy: ObjectId(req.user.id) }).populate("createdBy").sort({ updatedAt: "desc" }).lean();
  res.render("customers/notes-customer", { notes,customerId });
}

ctrl.updateCustomer = async (req, res) => {
  const { name, lastName, dni, email, address, phone, currentProduct, startDate, state } = req.body;
  //Si no hay un producto actual en el PUT entonces se modifican los datos del cliente
  if(!currentProduct || currentProduct == '0'){    
    if (state){
      await Customer.findByIdAndUpdate(req.params.id, { name, lastName, dni, email,address, phone, updatedBy: ObjectId(req.user.id) ,state: true });
    }else{
      await Customer.findByIdAndUpdate(req.params.id, { name, lastName, dni, email,address, phone, updatedBy: ObjectId(req.user.id) ,state: false});
    } 
    req.flash("success_msg", "Socio actualizado correctamente");
  }else{
    const old = await Customer.findById(req.params.id);
    if (((old.currentProduct == undefined || old.currentProduct == '0') && currentProduct!= '0')) {
      if(state){
        await Customer.findByIdAndUpdate(req.params.id, { name, lastName, dni, email, address, phone, updatedBy: ObjectId(req.user.id) ,state: true});
      }else{
        await Customer.findByIdAndUpdate(req.params.id, { name, lastName, dni, email, address, phone, updatedBy: ObjectId(req.user.id) ,state: false});
      }

      if (startDate) {
        var p = await Product.findOne({_id:currentProduct}).lean();
        var endDate =  getEndDate(startDate,p.sequence, p.duration);
        var nDaysTotal =  moment(endDate).diff(moment(startDate),'days');
        if(state){
          await Customer.findByIdAndUpdate(req.params.id, { name, lastName, dni, email, address, phone, currentProduct, startDate, updatedBy: ObjectId(req.user.id) ,state: true, endDate, nDaysTotal, currentProduct : ObjectId(currentProduct), nDaysTaked: 0, nDaysLeft: nDaysTotal, nDaysFreezing: 0, amountTotal: p.price, amountPayed: 0 });
        }else{
          await Customer.findByIdAndUpdate(req.params.id, { name, lastName, dni, email, address, phone, currentProduct, startDate, updatedBy: ObjectId(req.user.id) ,state: false, endDate, nDaysTotal, currentProduct : ObjectId(currentProduct), nDaysTaked: 0, nDaysLeft: nDaysTotal, nDaysFreezing: 0, amountTotal: p.price, amountPayed: 0});
        }
    
        const newHistory = new History (
          { 
            productId: ObjectId(p._id), customerId: ObjectId(req.params.id), createdBy: ObjectId(req.user.id), updatedBy: ObjectId(req.user.id), 
            registerDate: new Date(), startDate, endDate, nDaysTotal, nDaysTaked: 0, nDaysLeft: nDaysTotal, nDaysFreezing: 0, state:true, cancelDate: undefined
          }
        )
        await newHistory.save();
        req.flash("success_msg", "Socio actualizado correctamente");
      } 
    }
  }
  res.redirect("/customers");
}

ctrl.cancelPlanCustomer = async (req, res) => {
  const {customerId, productId} = req.params;
  
  await Customer.findByIdAndUpdate(customerId,{
    updatedBy: ObjectId(req.user.id), currentProduct: undefined, startDate: undefined, endDate: undefined, nDaysTotal: 0, nDaysTaked: 0, nDaysLeft: 0, nDaysFreezing: 0
  }); 
  
  const history = await History.findOne({customerId, productId, state: true}).lean();
  await History.findByIdAndUpdate(history._id, {state:false,cancelDate: new Date()});

  req.flash("success_msg", "Plan cancelado");
  res.redirect("/customers");
}

ctrl.paymentCustomer = async (req, res) => {
  const {customerId, productId} = req.params;
  const customer = await Customer.findById(customerId).lean();
  if (customer.currentProduct == productId){
    console.log("Es el plan actual")
    if (customer.currentProduct){
      customer.currentProduct = await Product.findById(customer.currentProduct).lean()
    }
  }else{
    console.log("Es el plan historico")
    customer.currentProduct = await Product.findById(productId).lean()
    const history = await History.findOne({productId, customerId})
    if(history){
      
      customer.startDate = history.startDate;  
      customer.endDate = history.endDate;
    }
  } 
  customer.payments = await Payment.find({productId, customerId}).populate('createdBy').lean()

  if (customer.payments ){
    var payed = 0;
    customer.payments .forEach(e=>{
      payed = payed+ e.amountPayed;
    })
    customer.amountTotal = customer.currentProduct.price;
    customer.amountPayed = payed;
  }

  
  
  res.render('customers/payment-customer', { customer })
}

ctrl.createNewPayment = async (req, res) => {
  const {customerId, productId, amountPayed, type} = req.body;
  
  if (type == '0' || isNaN(parseInt(amountPayed))){
    if (type == '0'){
      req.flash("error_msg", "Seleccione un tipo de pago");
    }
    if (isNaN(parseInt(amountPayed))){
      req.flash("error_msg", "Ingrese un valor correcto de couta");
    }
    res.redirect("/customers/payments/"+customerId+"/"+productId);
  }else{
    const c = await Customer.findById(customerId).lean();
    const p = await Product.findById(productId).lean();
    c.amountTotal = p.price;
      
    const oldPayments  = await Payment.find({productId, customerId}).lean();
    const newPayment = new Payment({ productId, customerId, createdBy: ObjectId(req.user.id), amountPayed, type});
    
    var payed = amountPayed;
      if (oldPayments.length){
        oldPayments.forEach( e => { 
          console.log(payed);
          payed = e.amountPayed*1.0 + payed*1.0;
        });
      }
    
      c.amountPayed = payed;
    
    if (p.price == payed) {
      newPayment.state = true;
    }else{
      newPayment.state = false;      
    }
  
    if( c.amountPayed > p.price){
      req.flash("error_msg", "El monto ingresado con los pagos realizados supera el valor del plan");
    }else{
      console.log("datos a actualizar");
      console.log({ amountPayed: c.amountPayed, amountTotal: p.price})
      await Customer.findByIdAndUpdate(customerId,{ amountPayed: c.amountPayed, amountTotal: p.price});
      await newPayment.save();
      c.payments = await Payment.find({productId,customerId}).populate('createdBy').lean()
    }
  
    res.redirect("/customers/payments/"+customerId+"/"+productId);
  } 
}

ctrl.createNewNote = async  (req, res) => {
  const { customerId,title, description } = req.body;
  const note = new Note({createdBy:ObjectId(req.user.id), customerId, title, description})
  await note.save();
  res.redirect("/customers/notes/"+customerId);
}

ctrl.updateNote = async (req, res) => {
  const { customerId,title, description } = req.body;
  await Note.findByIdAndUpdate(req.params.noteId,{customerId,title, description}).lean();
  res.redirect("/customers/notes/"+customerId);
}

ctrl.deleteNote = async (req, res) => {
  const { customerId } = req.body
  const { noteId} = req.params;
  await Note.findByIdAndDelete(noteId);
  res.redirect("/customers/notes/"+customerId);
}

ctrl.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).lean();
    if (customer) {
      const history = await History.findOne({customerId:customer._id, productId:customer.currentProduct, state: true}).lean();
      if (history) {
        await History.findByIdAndUpdate(history._id, {state:false,cancelDate: new Date()});
      }
      await Customer.findByIdAndUpdate(customer._id,
        {
          deleted: true, updatedBy: ObjectId(req.user.id), cancelDate: undefined,
          startDate: undefined, endDate: undefined, currentProduct: undefined, 
          nDaysTotal: 0, nDaysTaked: 0,nDaysLeft:0, nDaysFreezing:0,state: false,
          dni: "*-" + customer.dni + "-" + (Math.random() * (1000-10)+10) + "-*"
        }
      );
    }       
    req.flash("success_msg", "Socio borrado satisfactoriamente");
  } catch (error) {
    req.flash("error_msg", JSON.stringify(error));
  }
  res.redirect("/customers");
};

getEndDate = (startdate, sequence, duration) => {
  if (sequence == 'Dia' ){
    return moment(moment(startdate, "YYYY-MM-DD HH:mm:ss").add(duration, 'days')).format("YYYY-MM-DD HH:mm:ss");
  }
  if (sequence == 'Semana' ){
    return moment(moment(startdate, "YYYY-MM-DD HH:mm:ss").add(duration, 'weeks')).format("YYYY-MM-DD HH:mm:ss");
  }
  if (sequence == 'Mes' ){
    return moment(moment(startdate, "YYYY-MM-DD HH:mm:ss").add(duration, 'months')).format("YYYY-MM-DD HH:mm:ss");
  }
  if (sequence == 'Bimestre' ){
    return moment(moment(startdate, "YYYY-MM-DD HH:mm:ss").add(duration * 2, 'months')).format("YYYY-MM-DD HH:mm:ss");
  }
  if (sequence == 'Trimestre' ){
    return moment(moment(startdate, "YYYY-MM-DD HH:mm:ss").add(duration * 3, 'months')).format("YYYY-MM-DD HH:mm:ss");
  }
  if (sequence == 'Semestre' ){
    return moment(moment(startdate, "YYYY-MM-DD HH:mm:ss").add(duration * 6, 'months')).format("YYYY-MM-DD HH:mm:ss");
  }
  if (sequence == 'Anual' ){
    return moment(moment(startdate, "YYYY-MM-DD HH:mm:ss").add(duration, 'years')).format("YYYY-MM-DD HH:mm:ss");
  }

  return moment(startdate, "YYYY-MM-DD HH:mm:ss").add(0, 'days').format("YYYY-MM-DD HH:mm:ss");
} 

module.exports = ctrl;