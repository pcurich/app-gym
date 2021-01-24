const { Schema, model } = require("mongoose");
var mongoosePaginate = require('mongoose-paginate-v2');

const PaymentSchema = new Schema({
  productId:      { type: Schema.Types.ObjectId, ref: 'Product'},
  customerId:     { type: Schema.Types.ObjectId, ref: 'Customer'},
  createdBy:      { type: Schema.Types.ObjectId, ref: 'User'},
  amountPayed:    { type: Number },  
  type:           { type: String, enum: ['Efectivo', 'Tarjeta', 'Otro' ] },
  state:          { type: Boolean },
},{
  timestamps: true
},{
  collection: 'payments'
});

PaymentSchema.plugin(mongoosePaginate);
module.exports = model("Payment", PaymentSchema);