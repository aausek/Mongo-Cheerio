//Require mongoose
var mongoose = require("mongoose");
//Create schema class
var Schema = mongoose.Schema;

//Create article schema
var articleSchema = new Schema({
    //title string requirement
    title: {
        type: String,
        required: true
    },
    //link is a required string
    link: {
        type: String,
        required: true
    },
    //Saving the note's ObjectId & "ref" relates to the note model
    note: {
        type: Schema.Types.ObjectId,
        ref: "Note"
    }
});

//Create the article model with the articleSchema
var Article = mongoose.model("Article", articleSchema);

//Export the model
module.exports = Article;