//Require mongoose
var mongoose = require("mongoose"),
    //Declare var for schema class
    Schema = mongoose.Schema;

var noteSchema = new Schema({
    //String
    title: {
        type: String
    },
    //String
    body: {
        type: String
    }
});

//Create note model with noteschema
var Note = mongoose.model("Note", noteSchema);

//Export note model
module.exports = Note;