const spotifyParser = require("@utils/helper/spotifyParser")
const HttpError = require("@utils/error/http-error")
const spotWorker = require("@utils/service/spotifyWorker")
const reqForm = require("@utils/helper/requestFormat")
const request = require("@utils/helper/fetch")

/////////////////////////////////////////////////////////////////////

const getUserProfile = async (req, res, next) => {
    try {
        spotWorker.getCurrentUserProfile(req).then(response => {
            res.status(200).json(response)
        })
    } catch (err) {
        return next(err)
    }
}

const getUserTopItems = async(req, res, next) => {
    var {
        type="tracks",
        timeRange="medium_term",
        limit=10,
        offset=0
    } = req.query
    var query = { timeRange, limit, offset }
    if ( type=="tracks" ) {
        try {
            spotWorker.getCurrentTopTracks(req, query).then(response => {
                var top = response.items.map(target => {
                    return spotifyParser.itemParser(target)
                })
            
                res.status(200).json({ tracks:top, items: top.length })
            })
        } catch (err) {
            return next(err)
        }
    } else if ( type=="artists" ) {
        try {
            spotWorker.getCurrentTopArtists(req, query).then(response => {
                var top = response.items.map(target => {
                    return spotifyParser.itemParser(target)
                })
            
                res.status(200).json({ artists:top, items: top.length })
            })
        } catch (err) {
            return next(err)
        }
    } else {
        return next(new HttpError(400, "Invalid item type", 301))
    }
}

const getListeningHistory = async (req, res, next) => {
    var query = { limit: 50 }
    try {
        spotWorker.getCurrentListeningHistory(req, query).then(response => {
            var history = response.items.map(target => {
                return {
                    played_at: target.played_at,
                    ...spotifyParser.itemParser(target.track)
                }
            })
        
            res.status(200).json({ history, items: history.length })
        })
    } catch (err) {
        return next(err)
    }
}

const getRecommendedTracks = async (req, res, next) => { // TODO, WORK WITH DB, DONT ADD ALL FILTERS AS SPOTIFY WILL TIME OUT ON FIRST REQUEST
    var {
        limit=10,
        artists={useTop:false, range:"long_term", seed:""},
        genres={useTop:false, range:"medium_term", seed:""},
        tracks={useTop:false, range:"short_term", seed:""},
        acousticness={include:false, min: 0, max: 1, target: 0.5},
        danceability={include:false, min: 0, max: 1, target: 0.5},
        duration={include:false, min: 0, max: 180000, target: 60000},
        energy={include:false, min: 0, max: 1, target: 0.5},
        instrumentalness={include:false, min: 0, max: 1, target: 0.5},
        liveness={include:false, min: 0, max: 1, target: 0.5},
        loudness={include:false, min: -60, max: 0, target: -6},
        mode={include:false, min: 0, max: 1, target: 1}, // 0 for minor, 1 for major
        popularity={include:false, min: 0, max: 100, target: 80},
        speechiness={include:false, min: 0, max: 1, target: 0.5},
        tempo={include:false, min: 0, max: 1000, target: 160},
        valence={include:false, min: 0, max: 1, target: 0.5},
    } = req.body

    if ( artists.useTop ) {
        try {
            request.httpRequest(process.env.HOST+`/spotify/userTop?type=artists&timeRange=${artist.range}&limit=5`, "GET").then(response => {
                for ( var item in response.artists ) {
                    if (artists.seed != "") artists.seed = artists.seed+","
                    artists.seed = artists.seed + item.id
                }
            })
        } catch (err) {
            return next(new HttpError(500, "Failed to get user's top artist seed", 208))
        }
    }
    if ( tracks.useTop ) {

        try {
            request.httpRequest(process.env.HOST+`/spotify/userTop?type=tracks&timeRange=${tracks.range}&limit=5`,"GET").then(response => {
                for ( var item in response.tracks ) {
                    if (tracks.seed != "") tracks.seed = tracks.seed+","
                    tracks.seed = tracks.seed + item.id
                }
            })
        } catch (err) {
            return next(new HttpError(500, "Failed to get user's top artist seed", 209))
        }
    }
    if ( genres.useTop ) { // For now, seed with the top 1
        try {
            request.httpRequest(process.env.HOST+`/spotify/userTop?type=artists&timeRange=${artist.range}`,"GET").then(response => {
                var genres = {}
                for ( var item in response.artists ) {
                    for (var g in item.genres) {
                        if (genres[g]) {
                            genres[g] = genres[g] + 1
                        } else {
                            genres[g] = 1
                        }
                    }
                }
                var topGenre = ""
                var topCount = 0
                for (const [genre, count] of Object.entries(genres)) {
                    if (count > topCount) {
                        topGenre = genre,
                        topCount = count
                    }
                }
                genres.seed = topGenre
            })
        } catch (err) {
            return next(new HttpError(500, "Failed to get user's top genre seed", 210)) 
        }
    }

    var query = {
        limit,
        seed_artists: artists.seed,
        seed_genres: genres.seed,
        seed_tracks: tracks.seed
    }
    for (const key in req.body) {
        if (typeof req.body[key] === 'object' && req.body[key].include) {
            query[`min_${key}`]= req.body[key].min
            query[`max_${key}`]= req.body[key].max
            query[`target_${key}`]= req.body[key].target
        }
    }
    try {
        spotWorker.getRecommendedTracks(req,query).then(response => {
            var recommendations = response.tracks.map(track => spotifyParser.itemParser(track))
    
            res.status(200).json({ recommendations, items: recommendations.length })
        })
    } catch (err) {
        return next(err)
    }
}

const searchSpotify = async (req, res, next) => {
    var {
        album,
        artist,
        track,
        yearStart,
        yearEnd,
        genre,
        isUnpopular,
        isNew,
        irsc,
        type,
        limit,
        offset
    } = req.body
    var query = ""
    if (album) query = query + ` album:${album}`
    if (artist) query = query + ` artist:${artist}`
    if (track) query = query + ` track:${track}`
    if (yearStart) {
        if (yearStart == yearEnd) {
            query = query + ` year:${yearStart}`
        } else {
            query = query + ` year:${yearStart}-${yearEnd}`
        }
    }
    if (genre) query = query + ` genre:${genre}`
    if (isUnpopular) query = query + ` tag:hipster`
    if (isNew) query = query + ` tag:neq`
    if (irsc) query = query + ` irsc:${irsc}`

    var queryObj = {
        limit,
        offset,
        query,
        type: type.join(',')
    }
    try {
        spotWorker.getSearch(req, queryObj).then(response => {
            var results = {}
            for (const content in response) {
                contentResults = response[content].items.map(item => spotifyParser.itemParser(item))
                results[content] = { results: contentResults, items: contentResults.length }
            }
            
            res.status(200).json(results)
        })
    } catch (err) {
        return next(err)
    }
}

const listFeatures = async (req, res, next) => {
    var { ids } = req.body
    var query = { ids: ids.join(",") }
    spotWorker.getTracksFeatures(req, query).then(response => {
        res.status(200).json(response)
    })

    return
}

module.exports = {
	getUserProfile,
    getUserTopItems,
    getListeningHistory,
	getRecommendedTracks,
    searchSpotify,
    listFeatures
}
