const express = require("express")
const router = express.Router()

const authenticator = require("@utils/service/auth")

router.post("/login", authenticator.login)
router.post("/callback", authenticator.loginCallback)
router.post("/token-refresh", authenticator.tokenRefresh)

module.exports = router