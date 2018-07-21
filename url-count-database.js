const mongoose = require("mongoose")

const urlCountSchema = mongoose.Schema({
  count: Number,
  originalUrl: String
})

const UrlCount = mongoose.model("UrlCount", urlCountSchema)

module.exports = UrlCount
