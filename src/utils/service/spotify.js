const request = require("request")

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
                    album: {
                        id: target.track.album.id,
                        name: target.track.album.name,
                        images: target.track.album.images,
                        release_date: target.track.album.release_date_precision,
                        urls: target.track.album.external_urls,
                        artists: target.track.album.artists.map((artist) => {
                            return {
                                id: artist.id,
                                name: artist.name,
                                urls: artist.external_urls
                            }
                        })
                    },
                    track: {
                        duration: target.track.duration_ms,
                        explicit: target.track.explicit,
                        urls: target.track.external_urls,
                        id: target.track.id,
                        name: target.track.name,
                        spotify_popularity: target.track.popularity,
                        is_local_file: target.track.is_local,
                        artists: target.track.artists.map((artist) => {
                            return {
                                id: artist.id,
                                name: artist.name,
                                urls: artist.external_urls
                            }
                        })
                    }
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
			var recommendations = JSON.parse(body).tracks.map(track => {
                return {
                    album: {
                        id: track.album.id,
                        name: track.album.name,
                        images: track.album.images,
                        release_date: track.album.release_date_precision,
                        urls: track.album.external_urls,
                        artists: track.album.artists.map((artist) => {
                            return {
                                id: artist.id,
                                name: artist.name,
                                urls: artist.external_urls
                            }
                        })
                    },
                    track: {
                        duration: track.duration_ms,
                        explicit: track.explicit,
                        urls: track.external_urls,
                        id: track.id,
                        name: track.name,
                        spotify_popularity: track.popularity,
                        is_local_file: track.is_local,
                        artists: track.artists.map((artist) => {
                            return {
                                id: artist.id,
                                name: artist.name,
                                urls: artist.external_urls
                            }
                        })
                    }
                }
            })

            res.status(200).send({ recommendations, items: recommendations.length })

		} else {
			res.status(500).send({message: "Couldn't get recommendations", code: 203, error: error})
		}
	})
}

module.exports = {
    getListeningHistory,
	getUserProfile,
	getRecommendedTracks
}
