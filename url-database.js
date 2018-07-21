const mongoose = require("mongoose")

const urlSchema = mongoose.Schema({
  unique_id: Number,
  nameOfUser: String,
  originalUrl: String,
  shortenedUrl: String,
  createdAt: Date,
  hash: String
})

const Url = mongoose.model("Url", urlSchema)

module.exports = Url
