const albumParser = (album) => {
    return {
        type: album.album_type,
        uri: album.uri,
        name: album.name,
        total_tracks: album.total_tracks,
        release_date: album.release_date,
        external_urls: album.external_urls,
        restrictions: album.restrictions,
        artists: album.artists.map(artist => {
            return {
                id: artist.id,
                uri: artist.uri,
                name: artist.name,
                external_urls: artist.external_urls
            }
        })
    }
}

const artistParser = (artist) => {
    return {
        id: artist.id,
        uri: artist.uri,
        name: artist.name,
        external_urls: artist.external_urls,
        images: artist.images,
        followers: artist.followers ? artist.followers.total : null,
        genres: artist.genres,
        popularity: artist.popularity
    }
}

const trackParser = (track) => {
    return {
        id: track.id,
        uri: track.uri,
        name: track.name,
        duration: track.duration_ms,
        external_urls: track.external_urls,
        is_explicit: track.explicit,
        is_local: track.is_local,
        restrictions: track.restrictions,
        popularity: track.popularity
    }
}

const playlistParser = (playlist) => {
    return {
        id: playlist.id,
        uri: playlist.uri,
        name: playlist.name,
        description: playlist.description,
        external_urls: playlist.external_urls,
        images: playlist.images,
        owner: playlist.owner ? userParser(playlist.owner) : null,
        is_public: playlist.public
    }
}

const showParser = (show) => {
    return {
        id: show.id,
        uri: show.uri,
        name: show.name,
        description: show.description,
        publisher: show.publisher,
        external_urls: show.external_urls,
        images: show.images,
        is_explicit: show.explicit,
        languages: show.languages,
        total_episodes: show.total_episodes
    }
}

const episodeParser = (episode) => {
    return {
        id: episode.id,
        uri: episode.uri,
        name: episode.name,
        description: episode.description,
        duration: episode.duration_ms,
        external_urls: episode.external_urls,
        images: episode.images,
        languages: episode.languages,
        release_date: episode.release_date,
        restriction: episode.restrictions,
        is_explicit: episode.explicit

    }
}

const audiobookParser = (audiobook) => {
    return {
        id: audiobook.id,
        uri: audiobook.uri,
        name: audiobook.name,
        edition: audiobook.edition,
        description: audiobook.description,
        authors: audiobook.authors.map(author => author.name),
        narrators: audiobook.narrators.map(nar => nar.name),
        publisher: audiobook.publisher,
        images: audiobook.images,
        languages: audiobook.languages,
        total_chapters: audiobook.total_chapters

    }
}

const userParser = (user) => {
    return {
        id: user.id,
        uri: user.uri,
        name: user.display_name,
        followers: user.followers.total,
        external_urls: user.external_urls
    }
}

const itemParser = (item) => {
    var result = {
        type: item.type,
        type_details: {}
    }

    if (item.type == "track") {
        result.type_details = {
            album: albumParser(item.album),
            artists: item.artists.map(artist => artistParser(artist)),
            track: trackParser(item)
        }
    } else if (item.type == "artist") {
        result.type_details = { artist: artistParser(item) }
    } else if (item.type == "album") {
        result.type_details = { album: albumParser(item) }
    } else if (item.type == "playlist") {
        result.type_details = { playlist: playlistParser(item) }
    } else if (item.type == "show") {
        result.type_details = { show: showParser(item) }
    } else if (item.type == "episode") {
        result.type_details = { episode: episodeParser(item) }
    } else if (item.type == "audiobook") {
        result.type_details = { audiobook: audiobookParser(item) }
    }

    return result
}

module.exports = {
    albumParser,
    artistParser,
    trackParser,
    playlistParser,
    showParser,
    episodeParser,
    audiobookParser,
    itemParser
}