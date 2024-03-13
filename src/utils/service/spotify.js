const request = require("request")
const querystring = require("querystring")
const spotifyParser = require("@utils/helper/spotifyParser")

const getListeningHistory = async (req, res, next) => {
    var options = {
        url: 'https://api.spotify.com/v1/me/player/recently-played?limit=50',
        headers: {
            Authorization: 'Bearer ' + (req.cookies && req.cookies["access-token"] ? req.cookies["access-token"] : "")
        },
    };

    request.get(options, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            var history = JSON.parse(body).items.map(target => {
                return {
                    played_at: target.played_at,
                    ...itemParser(target.track)
                }
            })

            res.status(200).send({ history, items: history.length })
        } else {
            res.status(500).send({message: "Couldn't get history", code: 201, error: body})
        }
    })
}

const getUserProfile = async (req, res, next) => {
    var options = {
        url: 'https://api.spotify.com/v1/me',
        headers: {
            Authorization: 'Bearer ' + (req.cookies && req.cookies["access-token"] ? req.cookies["access-token"] : "")
        },
    };

	request.get(options, function(error, response, body) {
		if (!error && response.statusCode == 200) {
			res.status(200).json(body)
		} else {
			res.status(500).send({message: "Couldn't get user profile", code: 202, error: error})
		}
	})
}

const getRecommendedTracks = async (req, res, next) => {
	var options = {
        url: 'https://api.spotify.com/v1/recommendations?seed_tracks=0c6xIDDpzE81m2q797ordA&limit=10',
        headers: {
            Authorization: 'Bearer ' + (req.cookies && req.cookies["access-token"] ? req.cookies["access-token"] : "")
        },
    };

	request.get(options, function(error, response, body) {
		if (!error && response.statusCode == 200) {
			var recommendations = JSON.parse(body).tracks.map(track => spotifyParser.itemParser(track))

            res.status(200).send({ recommendations, items: recommendations.length })

		} else {
			res.status(500).send({message: "Couldn't get recommendations", code: 203, error: error})
		}
	})
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
    if (album) {
        query = query + ` album:${album}`
    }
    if (artist) {
        query = query + ` artist:${artist}`
    }
    if (track) {
        query = query + ` track:${track}`
    }
    if (yearStart) {
        if (yearStart == yearEnd) {
            query = query + ` year:${yearStart}`
        } else {
            query = query + ` year:${yearStart}-${yearEnd}`
        }
    }
    if (genre) {
        query = query + ` genre:${genre}`
    }
    if (isUnpopular) {
        query = query + ` tag:hipster`
    }
    if (isNew) {
        query = query + ` tag:neq`
    }
    if (irsc) {
        query = query + ` irsc:${irsc}`
    }

    var options = {
        url: 'https://api.spotify.com/v1/search?' + querystring.stringify({
            limit,
            offset,
            query,
            type: type.join(',')
        }),
        headers: {
            Authorization: 'Bearer ' + (req.cookies && req.cookies["access-token"] ? req.cookies["access-token"] : "")
        },
    };

    request.get(options, (error, response, body) => {
        if (!error && response.statusCode == 200) {
            const parsedData = JSON.parse(body)
            var results = {}
            for (const content in parsedData) {
                contentResults = parsedData[content].items.map(item => spotifyParser.itemParser(item))
                results[content] = { results: contentResults, items: contentResults.length }
            }
            res.status(200).send(results)
        } else {
            console.log(response.statusCode)
            console.log(body)
			res.status(500).send({message: "Couldn't get search results", code: 204, error: error})
		}
    })
}

module.exports = {
    getListeningHistory,
	getUserProfile,
	getRecommendedTracks,
    searchSpotify
}
