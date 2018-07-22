const mongoose = require("mongoose")

const urlSchema = mongoose.Schema({
  nameOfUser: String,
  longUrl: String,
  shortenedUrl: String,
  createdAt: Date
})

const Url = mongoose.model("Url", urlSchema)

module.exports = Url
