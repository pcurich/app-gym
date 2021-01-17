const { Schema, model } = require("mongoose");
var mongoosePaginate = require('mongoose-paginate-v2');

const CustomerSchema = new Schema({
  name:           { type: String, required: true, trim: true },
  lastName:       { type: String, required: true, trim: true },
  dni:            { type: Number, required: true, unique: true },
  email:          { type: String },
  createdBy:      { type: Schema.Types.ObjectId, ref: 'User'},
  updatedBy:      { type: Schema.Types.ObjectId, ref: 'User'},
  registerDate :  { type: Date },
  currentProduct: { type: Schema.Types.ObjectId, ref: 'Product'},
  startDate :     { type: Date },
  endDate :       { type: Date },
  nDaysTotal:     { type: Number },
  nDaysTaked:     { type: Number },
  nDaysLeft:      { type: Number },
  nDaysFreezing:  { type: Number },
  state:          { type: Boolean },
  deleted:        { type: Boolean },
},{
  timestamps: true
},{
  collection: 'customers'
});

CustomerSchema.plugin(mongoosePaginate);
module.exports = model("Customer", CustomerSchema);