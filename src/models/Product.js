const { Schema, model } = require("mongoose");
var mongoosePaginate = require('mongoose-paginate-v2');

const ProductSchema = new Schema({
  name:           { type: String, required: true, trim: true },
  description:    { type: String, trim: true, default: '' },
  createdBy:      { type: Schema.Types.ObjectId, ref: 'User'},
  updatedBy:      { type: Schema.Types.ObjectId, ref: 'User'},
  price:          { type: Number, min: [1, 'El valor minimo es S/ 1']},
  duration:       { type: Number},
  sequence:       { type: String, enum: ['Dia', 'Semana', 'Mes', 'Bimestre', 'Trimestre', 'Semestre', 'Anual' ],},
  state:          { type: Boolean },
  deleted:        { type: Boolean },
},{
  timestamps: true
},{
  collection: 'products'
});

ProductSchema.plugin(mongoosePaginate);
module.exports = model("Product", ProductSchema);