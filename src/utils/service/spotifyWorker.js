const querystring = require("querystring")
const reqForm = require("@utils/helper/requestFormat")
const request = require("@utils/helper/fetch")
const HttpError = require("@utils/error/http-error")

const createWorker = (url, method, errorMessage, errorInternalCode) => {
    return async function (req, query={}) {
        var options = reqForm.addAuthToken( req, { method } )

        try {
            var response = await request.httpRequest(url+(query ? "?"+querystring.stringify(query) : ""), options)
        } catch (err) {
            throw new HttpError(err.httpCode, errorMessage, errorInternalCode)
        }
        return response
    }
}

const getCurrentUserProfile = createWorker('https://api.spotify.com/v1/me', 'GET', "Failed to fetch user profile from Spotify.", 201)
const getCurrentListeningHistory = createWorker('https://api.spotify.com/v1/me/player/recently-played', "GET", "Failed to fetch history from Spotify.", 202)
const getRecommendedTracks = createWorker('https://api.spotify.com/v1/recommendations', 'GET', "Failed to fetch recommendations from Spotify.", 203)
const getSearch = createWorker('https://api.spotify.com/v1/search', 'GET', "Failed to fetch search results from Spotify.", 204)
const getTracksFeatures = createWorker('https://api.spotify.com/v1/audio-features', 'GET', 'Failed to get audio features for tracks from Spotify', 206)
const getCurrentTopTracks = createWorker('https://api.spotify.com/v1/me/top/tracks', 'GET', 'Failed to get user\'s top tracks from Spotify', 206)
const getCurrentTopArtists = createWorker('https://api.spotify.com/v1/me/top/artists', 'GET', 'Failed to get user\'s top Artists from Spotify', 207)

module.exports = {
    getCurrentUserProfile,
    getCurrentListeningHistory,
    getRecommendedTracks,
    getSearch,
    getTracksFeatures,
    getCurrentTopTracks,
    getCurrentTopArtists
}