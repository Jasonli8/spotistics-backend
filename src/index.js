require('module-alias/register')

const express = require('express')
const server = express()
const port = 3000

const cors = require('cors')
const cookieParser = require('cookie-parser')

///////////////////////////////////////////////////////////// ROUTER IMPORTS

const authRouter = require("@router/auth/authRouter")
const testRouter = require("@router/test/testRouter")

///////////////////////////////////////////////////////////// ROUTING

server.use(cookieParser())
      .use(cors());

server.use("/auth", authRouter)
server.use("/test", testRouter)

server.get('/', (req, res) => { // debug
  res.send('Hello World!')
})

///////////////////////////////////////////////////////////// ERROR RESPONSE HANDLING

server.use((error, req, res, next) => {
  res.status(error.code || 500).json({message: error.message || "An unknown error occured" })
})

///////////////////////////////////////////////////////////// SERVER START

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
