const express = require("express")
const router = express.Router()

const authenticator = require("@utils/service/auth")

router.get("/test", async (req, res, next) => {
    res.redirect("http://localhost:3000/test/testCallback")
})

router.get("/testCallback", async (req, res, next) => {
    res.status(200).send({message: "Hello World"})
})

module.exports = router
