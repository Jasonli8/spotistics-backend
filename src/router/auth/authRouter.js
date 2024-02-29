const express = require("express")
const router = express.Router()

const authenticator = require("@utils/service/auth")

router.get("/login", authenticator.login)
router.get("/callback", authenticator.loginCallback)
router.get("/refresh-token", authenticator.refreshToken)

module.exports = router
