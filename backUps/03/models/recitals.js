var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var RecitalSchema = new Schema({
    code: { type: String },
    page: { type: Number, min: 1, max: 604, required: true, default: 2 },
    pages: { type: Number, min: 1, max: 5, required: true, default: 1 },
    fatiha: { type: Boolean, default: false }
}, { timestamps: true });
//
// 
//
/**
*********** INSERT the "KHATMA" record in the recitals table 
**  as follows
**  1- open up a Command Prompt window -start mongodb
**  2- open up another Command Prompt window - start mongo shell
**  3- run the following command in mongo shell:
*   4- db.recitals.insert({code:"KHATMA", page: 1, pages: 1, fatiha:true });
*/
module.exports = mongoose.model('Recitals', RecitalSchema);