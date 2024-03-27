require('module-alias/register')
const env = require('dotenv')
env.config()

const cors = require('cors')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')

const express = require('express')
const server = express()
const port = process.env.PORT

///////////////////////////////////////////////////////////// ROUTER IMPORTS

const authRouter = require("@router/auth/authRouter")
const spotRouter = require("@router/spotify/spotifyRouter")
const testRouter = require("@router/test/testRouter")

///////////////////////////////////////////////////////////// ROUTING

server.use(bodyParser.json())
server.use(cookieParser())
server.use(cors());

server.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  next();
});

server.use("/auth", authRouter)
server.use("/spotify", spotRouter)

///////////////////////////////////////////////////////////// ERROR RESPONSE HANDLING

server.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error)
  }
  res.status(error.httpCode || 500).json({ message: error.message || "An unknown error occured", code: error.internalCode || 0 })
})

///////////////////////////////////////////////////////////// SERVER START

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
