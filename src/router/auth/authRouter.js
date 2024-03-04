const express = require("express")
const router = express.Router()

const authenticator = require("@utils/service/auth")

router.get("/loginPageURL", authenticator.login)
router.get("/loginCallback", authenticator.loginCallback)
router.get("/redeemCode", authenticator.redeemCode)
router.get("/refreshToken", authenticator.refreshToken)

module.exports = router
