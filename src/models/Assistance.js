const { Schema, model } = require("mongoose");
var mongoosePaginate = require('mongoose-paginate-v2');

const AssistanceSchema = new Schema({
  productId:      { type: Schema.Types.ObjectId, ref: 'Product'},
  customerId:     { type: Schema.Types.ObjectId, ref: 'Customer'},
  createdBy:      { type: Schema.Types.ObjectId, ref: 'User'},
  updatedBy:      { type: Schema.Types.ObjectId, ref: 'User'},
  entryDate:      { type: Date },
  outputDate:     { type: Date },
  duration:       { type: Number }  
},{
  timestamps: true
},{
  collection: 'assists'
});

AssistanceSchema.plugin(mongoosePaginate);
module.exports = model("Assistance", AssistanceSchema);