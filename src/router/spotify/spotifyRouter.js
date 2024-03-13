const express = require("express")
const router = express.Router()

const spotify = require("@utils/service/spotify")

router.get("/history", spotify.getListeningHistory)
router.get("/user", spotify.getUserProfile)
router.get("/recommend", spotify.getRecommendedTracks)
router.post("/search", spotify.searchSpotify)

module.exports = router
