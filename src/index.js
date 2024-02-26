require('module-alias/register')

const express = require('express')
const server = express()
const port = 3000

///////////////////////////////////////////////////////////// ROUTER IMPORTS

const authRouter = require("@router/auth/authRouter")

///////////////////////////////////////////////////////////// ROUTING

server.use("/auth", authRouter)

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