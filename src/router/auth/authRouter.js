const express = require("express")
const router = express.Router()

const authenticator = require("@utils/service/auth")

router.post("/login", authenticator.login)

module.exports = router