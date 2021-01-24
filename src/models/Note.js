const { Schema, model } = require("mongoose");
var mongoosePaginate = require('mongoose-paginate-v2');

const NoteSchema = new Schema(
  {
    title: { type: String,required: true },
    description: { type: String,required: true},
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
  },
  {
    timestamps: true
  },{
    collection: 'notes'
  });

NoteSchema.plugin(mongoosePaginate);
module.exports = model("Note", NoteSchema);