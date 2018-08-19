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

// console.log(db.Saved);

// Connect to the Mongo DB
// mongoose.connect("mongodb://localhost/datager");
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/datager";
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

// Home Page - data.handlebars
app.get("/", function (req, res) {
    res.render("index");
});

// app.get("/saved-articles", function (req, res) {
//     res.render("saved-articles");
// });

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

            // console.log("my result: ", result);

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
        // window.location.href = "/";
        
        // res.send("Scraped Data");
        res.render("scraped");
        
    });


});

// Getting all notes and rendering it to notes page
app.get("/notes", function (req, res) {
    db.Note.find({})
        .then(function (dbNotes) {
            // If we were able to successfully find Articles, send them back to the client
            console.log("finding all notes", dbNotes);

            var obj = {
                title: [],
                body: [],
                id: []
            }

            for (let i = 0; i < dbNotes.length; i++) {

                var title = obj.title.push(dbNotes[i].title);
                var body = obj.body.push(dbNotes[i].body);
                var id = obj.id.push(dbNotes[i]._id);
            }

            // console.log("obj:", obj);

            res.render("notes", { notes: dbNotes });
            // res.json(dbNotes)
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            console.log(err)
            res.json(err);
        });
});

// Finding all notes
app.get("/api/notes", function (req, res) {
    db.Note.find({})
        .then(function (dbNotes) {
            res.json(dbNotes);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            console.log(err)
            res.json(err);
        });
});

// Deleting note
app.delete("/api/saved-notes/:id", function (req, res) {
    // console.log(`id: ${req.params.id}`)

    db.Note.findOneAndRemove({ _id: req.params.id }, function (err) {
        if (err) {
            console.log("my error: ", err);
        }
        return res.status(500).send();
    });
    return res.status(200).send();
});



// finding specific note
app.get("/notes/:id", function (req, res) {
    db.Note.findOne({ _id: req.params.id })
        .populate("note")
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

app.get("/saved-articles", function (req, res) {
    // console.log('articles ', req.params);
    db.Article.find({ saved: true })
        .then(function (dbArticles) {
            // If we were able to successfully find Articles, send them back to the client
            // console.log(`Article ids: ${dbArticles}`);
            console.log("my saved articles", dbArticles);
            res.render("saved-articles", {userSavedArticles: dbArticles});
            // res.send(dbArticles);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            console.log(err)
            res.json(err);
        });
});


app.get("/all/saved-articles", function (req, res) {
    db.Article.find({ saved: true })
        .then(function (saved) {
            // console.log("Whats saved? :", saved);
            // res.send(saved);
            res.json(saved);
        }).catch(function (err) {
            // If an error occurred, send it to the client
            console.log(err)
            res.json(err);
        })
});

app.post("/api/saved-articles", function (req, res) {

    console.log("req.body:", req.body);

    // console.log("article id:", req.body.articles[0]);
    // console.log("article array parsed: ", JSON.parse(req.body.articles));
    var parsedArticle = JSON.parse(req.body.articles);
    console.log("new parsed req.body: ", parsedArticle);
    // console.log(req.body.article);

    for (var i = 0; i < parsedArticle.length; i++) {
        db.Article.findOneAndUpdate({ _id: parsedArticle[i].id }, { saved: true }, function (err) {

            if (err) {
                console.log("my error: ", err);
            }


            return res.status(500).send();
        }).then(function (savedArticles) {
            // If we were able to successfully find Articles, send them back to the client
            console.log(`Saved ids: ${savedArticles}`);

            // savedArticlesArray.push(savedArticles);

            // res.json(savedArticles)
            // for (let x = 0; x < savedArticles.length; x++) {
            //     // If article is saved and === true then we send it to the frontend
            //     var ifSaved = savedArticles[x].saved === true;
            //     console.log("my saved article", savedArticles[0].saved);

            //     console.log("If article saved: (should always be true) ", ifSaved)
            //     if (ifSaved) {

            //     }
            // }


            // res.render("saved-articles", { userSavedArticles: savedArticles });


            // savedArticles.forEach(function(element){
            //     if(element.saved === true){
            //         res.render("saved-articles", { userSavedArticles: savedArticles });
            //     }
            // }); 

            // res.render("saved-articles");
        })
            .catch(function (err) {
                // If an error occurred, send it to the client
                console.log(err)
                res.json(err);
            });
    }


    // return res.status(200).send();

    // console.log("sending articles..", savedArticlesArray);


    res.json(req.body);
});

app.post("/saved-articles/:id", function (req, res) {
    db.Article.findOneAndUpdate({ _id: req.params.id }, { saved: true }, function (err) {
        if (err) {
            console.log(err);
        }
        return res.status(500).send();
    }).then(function(newtrue){
        console.log(newtrue);
    })
    return res.status(200).send();
});


app.delete("/api/saved-articles/:id", function (req, res) {
    // console.log(`id: ${req.params.id}`)

    db.Article.findOneAndUpdate({ _id: req.params.id }, { saved: false }, function (err) {
        if (err) {
            console.log("my error: ", err);
        }
        return res.status(500).send();
    });
    return res.status(200).send();
});


// Route for getting all Articles from the db displayed as JSON
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
// Route for grabbing a specific Article by id, populate it with it's note displayed as JSON
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



// if (window.location === '/scrape'){
//     console.log("I'm home!");
//     window.location.pathname = '/';
//   }