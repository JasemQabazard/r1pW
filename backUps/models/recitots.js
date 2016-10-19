var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ReciTotsSchema = new Schema({
    codes: { type: Number, required: true, default: 0 },
    recitals: { type: Number, required: true, default: 0 },
    pages: { type: Number, required: true, default: 0 },
    fatihas: { type: Number, required: true, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('ReciTots', ReciTotsSchema);
