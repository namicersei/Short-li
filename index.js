//* ***************************** Important libraries*************************************************************/

const express = require("express")
const mongoose = require("mongoose")
const bodyParser = require("body-parser")

//* ************************* Prerequisites for login and registration***************************************/


const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")

// *******************Prerequisites for shortening url******************************************************/

const cuid = require("cuid")
const isUrl = require("is-url")

//* ********************************Databases****************************************/

const User = require("./user-database.js")
const Url = require("./url-database.js")
mongoose.connect("mongodb://localhost:27017/shortli", { useNewUrlParser: true })


const app = express()
app.use(bodyParser.json())

const secretKey = "secretkey"

//* ************* Registration and login**************************************************************************/

// Midlle ware for hashing password

const hashWare = function (req, res, next) {
  const { password } = req.body
  const saltRounds = 10
  console.log(password)
  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (hash) {
      req.body.password = hash
      console.log(password)

      next()
    } else {
      throw new Error("Could not register. Try again later")
    }
  })
}

// Registration

app.post("/register", hashWare, (req, res) => {
  const user = new User(req.body)
  user
    .save()
    .then(data => res.status(200).send(`Congrats! Welcome ${data.username}`))
    .catch(err => res.status(500).send("Sorry! Could not register ! Try again later!!"))
})

// // login

app.post("/login", (req, res) => {
  const { username } = req.body
  User
    .findOne({ username })
    .exec()
    .then((data) => {
      if (!data) throw new Error("No such user")
      const { password } = data
      return bcrypt.compare(req.body.password, password)
    })
    .then((result) => {
      if (result) {
        jwt.sign({
          email: username,
          expiresIn: "1 h"
        },
        secretKey,
        (err, token) => {
          if (err) res.status(500).send(err.message)
          if (token) res.send(token)
        })
      } else {
        res.send("Not a valid user!") // wrong login credentials
      }
    })
    .catch(err => console.log(err))
    .catch(err => res.status(403).send(err.message))
})

// **********************************Routes**********************************************************************/

// Middle ware for checking the user//

const verifyWare = function (req, res, next) {
  const token = req.headers.authorization
  const decoded = jwt.verify(token, secretKey)
  if (decoded) {
    res.locals.user = decoded.email
    next()
  } else {
    res.status(400).send("Not a valid user!")
  }
}

app.use(verifyWare)

// Route for getting tiny urls*************************************

app.post("/getShort", (req, res) => {
  const { originalUrl } = req.body

  if (isUrl(originalUrl)) {
  // Find if the url is already prsent or not

  // Else make a new shortUrl
    let shortUrl = "http://shortli/"
    const uniqueId = cuid.slug()
    shortUrl += uniqueId
    const url = new Url({
      nameOfUser: res.locals.user,
      longUrl: originalUrl,
      shortenedUrl: shortUrl,
      createdAt: new Date()
    })
    url
      .save()
      .then((data) => {
        res.json(shortUrl)
      })
      .catch(err => res.status(401).send("Sorry! Could not process your request! Try again later."))
  } else {
    console.log("Please enter new url!")
  }
})

// Route for getting the users list of tiny urls ***********************

app.get("/getList", (req, res) => {
  Url
    .find({ nameOfUser: res.locals.user }, {
      _id: 0,
      longUrl: 1,
      shortenedUrl: 1
    })
    .exec()
    .then((data) => {
      res.send(data)
    })
    .catch(err => res.status(401).send(err.message))
})


// *************************************Port settings*******************************************************//

app.listen(3000, () => console.log("Example app listening on port 3000!"))
