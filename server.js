//DEPENDENCIES
var bodyParser = require("body-parser"),
    cheerio = require("cheerio"),
    express = require("express"),
    hbs = require("express-handlebars"),
    mongoose = require("mongoose"),
    request = require("request");

//Requiring Note & Article models
var Note = require("./models/note.js"),
    Article = require("./models/article.js");

//Set mongoose to leverage built in JS ES6 Promises
mongoose.Promise = Promise;

//Start express app
var app = express();

//Use body-parser pkg with app
app.use(bodyParser.urlencoded({
    extended: false
}));

//Make public a static dir
app.use(express.static("public"));

//Database configuration with mongoose
var databaseUri = "mongodb://heroku_fbm9dtm8:e9c01haal89lnlum8becvn1jpe@ds017726.mlab.com:17726/heroku_fbm9dtm8";

if (process.env.MONGODB_URI) {
    mongoose.connect(process.env.MONGODB_URI);
} else {
    mongoose.connect(databaseUri);
}

var db = mongoose.connection;

//Display mongoose errors
db.on("error", function(error) {
    console.log("Mongoose Error:", error);
});

//Once logged into to the db through mongoose, log a successful msg
db.once("once", function() {
    console.log("Mongoose connection successful!");
});

//ROUTES

//GET request to scrape the CNET website
app.get("/scrape", function(req, res) {
    //Grab body of the html of via request
    request("https://www.cnet.com/", function(error, response, html) {
        //Load into cheerio and assign to $
        var $ = cheerio.load(html);
        //Grab every h2 within a title tag
        $("article h2").each(function(i, element) {
            //Save empty result object
            var result = {};

            //Add the text and href of every link & save them as properties 
            //of the result of the object
            result.title = $(this).children("a").text();
            result.link = $(this).children("a").attr("href");

            //Using the article model, create new entry
            //This passes the result object 
            var entry = new Article(result);

            //Now, save the entry to the db
            entry.save(function(error, doc) {
                //Log errors
                if (error) {
                    console.log(error);
                }
                //Log the doc
                else {
                    console.log(doc);
                }
            });
        });
    });
    //Tell me the browser
    res.send("Scrape Complete");
});
//This will get the articles we scraped from the mongoDB
app.get("/articles", function(req, res) {
    //Grab every doc in the Articles array
    Article.find({}, function(error, doc) {
        // Log any errors
        if (error) {
            console.log(error);
        }
        //Or send the doc to the browser as a json object
        else {
            res.json(doc)
        }
    });
});

// Grab an article by it's ObjectId
app.get("/articles/:id", function(req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    Article.findOne({
            "_id": req.params.id
        })
        // ..and populate all of the notes associated with it
        .populate("note")
        // now, execute our query
        .exec(function(error, doc) {
            // Log any errors
            if (error) {
                console.log(error);
            }
            // Otherwise, send the doc to the browser as a json object
            else {
                res.json(doc);
            }
        });
});


// Create a new note or replace an existing note
app.post("/articles/:id", function(req, res) {
    // Create a new note and pass the req.body to the entry
    var newNote = new Note(req.body);

    // And save the new note the db
    newNote.save(function(error, doc) {
        // Log any errors
        if (error) {
            console.log(error);
        }
        // Otherwise
        else {
            // Use the article id to find and update it's note
            Article.findOneAndUpdate({
                    "_id": req.params.id
                }, {
                    "note": doc._id
                })
                // Execute the above query
                .exec(function(err, doc) {
                    // Log any errors
                    if (err) {
                        console.log(err);
                    } else {
                        // Or send the document to the browser
                        res.send(doc);
                    }
                });
        }
    });
});

// Listen on port 3000
app.listen(3000, function() {
    console.log("App running on port 3000!");
});