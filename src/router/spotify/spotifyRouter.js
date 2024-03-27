const express = require("express")
const router = express.Router()

const spotify = require("@utils/endpoints/spotify")

router.get("/user", spotify.getUserProfile)
router.get("/userTop", spotify.getUserTopItems)
router.get("/history", spotify.getListeningHistory)
router.post("/recommend", spotify.getRecommendedTracks)
router.post("/search", spotify.searchSpotify)
router.post("/features", spotify.listFeatures)

module.exports = router
