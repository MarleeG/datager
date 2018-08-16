var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var SavedSchema = new Schema({
  // `title` is of type String
  title: String,
  // `body` is of type String
  body: String
});

var SavedArticle = mongoose.model("Note", SavedSchema);

// Export the Note model
module.exports = SavedArticle;
