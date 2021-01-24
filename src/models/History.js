const { Schema, model } = require("mongoose");
var mongoosePaginate = require('mongoose-paginate-v2');

const HistorySchema = new Schema({
  productId:      { type: Schema.Types.ObjectId, ref: 'Product'},
  customerId:     { type: Schema.Types.ObjectId, ref: 'Customer'},
  createdBy:      { type: Schema.Types.ObjectId, ref: 'User'},
  updatedBy:      { type: Schema.Types.ObjectId, ref: 'User'},
  registerDate:   { type: Date },
  cancelDate:     { type: Date },
  startDate:      { type: Date },
  endDate:        { type: Date },
  nDaysTotal:     { type: Number },
  nDaysTaked:     { type: Number },
  nDaysLeft:      { type: Number },
  nDaysFreezing:  { type: Number },
  state:          { type: Boolean }
},{
  timestamps: true
},{
  collection: 'histories'
});

HistorySchema.plugin(mongoosePaginate);
module.exports = model("History", HistorySchema);