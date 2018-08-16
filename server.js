// Dependencies

// Express
var express = require('express');

// Body-Parser
var bodyParser = require("body-parser");

// Port
var PORT = process.env.PORT || 3000;

var app = express();

const path = require('path');

// Mongoose
var mongoose = require("mongoose");

// Cheerio 
var cheerio = require("cheerio");

// Request
var request = require('request');

// Middleware
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Express Handlebars
var exphbs = require('express-handlebars');

// Handlebars
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Require all my models
var db = require("./models");

// Connect to the Mongo DB
// mongoose.connect("mongodb://localhost/datager");
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/datager";
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

// Home Page - data.handlebars
app.get("/", function (req, res) {
    res.render("index");
});

app.get("/saved-articles", (req, res) => {
    res.render("saved");
});


//scraped articles putting in database
app.get("/scrape", function (req, res) {
    // First, we grab the body of the html with request

    request("https://www.vox.com/world", function (error, response, html) {
        // Load the html body from request into cheerio
        var $ = cheerio.load(html);
        // For each element with a "title" class
        // var result;
        $("h2.c-entry-box--compact__title").each(function (i, element) {

            var result = [];

            result.push({
                title: $(this).children("a").text(),
                link: $(this).children("a").attr("href"),
            });
           
            console.log("my result: ", result);

            // Create a new Article using the `result` object built from scraping
            db.Article.create(result)
                .then(function (dbArticle) {
                    // View the added result in the console
                    // console.log("dbArticle: ", dbArticle);
                    // res.json(dbArticle);
                })
                .catch(function (err) {
                    // If an error occurred, send it to the client
                    return res.json(err);
                });
        });
        res.send("Scraped Data");
    });


});

app.get("saved-notes", function (){
    db.notes.find({})
    .then(function(dbNotes) {
      // If we were able to successfully find Articles, send them back to the client
      console.log("finding all notes", dbNotes);
      res.json(dbNotes);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      console.log(err)
      res.json(err);
    });
})

// Route for getting all Articles from the db
app.get("/articles", function (req, res) {
    // Grab every document in the Articles collection
    db.Article.find({})
        .then(function (dbArticle) {
            // If we were able to successfully find Articles, send them back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});


// add cheerio

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function (req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.Article.findOne({ _id: req.params.id })
        // ..and populate all of the notes associated with it
        .populate("note")
        .then(function (dbArticle) {
            // If we were able to successfully find an Article with the given id, send it back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function (req, res) {
    // Create a new note and pass the req.body to the entry
    db.Note.create(req.body)
        .then(function (dbNote) {
            // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
            // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
            // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
            return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
        })
        .then(function (dbArticle) {
            // If we were able to successfully update an Article, send it back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

// Start the server
app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});
