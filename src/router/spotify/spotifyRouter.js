const express = require("express")
const router = express.Router()

const spotify = require("@utils/service/spotify")

router.get("/history", spotify.getHistory)

module.exports = router
