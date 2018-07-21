//* ***************************** Important libraries*************************************************************/

const express = require("express")
const mongoose = require("mongoose")
const bodyParser = require("body-parser")

//* ************************* Prerequisites for login and registration***************************************/


const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")

// *******************Prerequisites for shortening url******************************************************/

const shortid = require("short-id")
const validUrl = require("valid-url")

//* ********************************Databases****************************************/

const User = require("./user-database.js")
const Url = require("./url-database.js")
const UrlCount = require("./url-count-database.js")
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
  // user
  //   .save()
  //   .then(data => res.status(200).send(`Congrats! Welcome ${data.username}`))
  //   .catch(err => res.status(500).send("Sorry! Could not register ! Try again later!!"))
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
  console.log(decoded)
  if (decoded) {
    next()
  } else {
    res.status(400).send("Not a valid user!")
  }
}

app.use(verifyWare)

app.post("/getShort", (req, res) => {
  var count
  // if (validUrl.isUri()) {
  // // Find if the url is already prsent or not
  UrlCount.findOne({ sort: { count: -1 } }, {})
    .exec()
    .then((data) => {
      count = data
    })
    .catch(err => res.send(err))
  const map = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let shortUrl = ""
  let n = count
  while (n) {
    console.log(n)
    const c = map[n % 62]
    console.log(c)
    shortUrl += c
    n = Math.floor(n / 62);
    console.log(n)
  } 
  console.log(count)
  console.log(shortUrl)
  res.send("hi")
  // console.log(shortUrl)
  //   // urlCount
  //   //   .save()
  //   //   .then(data => console.log("hi"))
  //   //   .catch(err => res.send(err.message))

  // } else {
  //   console.log("Please enter new url!")
  // }
  // console.log(shortid.generate())
})

// *************************************Port settings*******************************************************//

app.listen(3000, () => console.log("Example app listening on port 3000!"))