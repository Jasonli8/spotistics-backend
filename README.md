# spotistics-backend

## Authentication
When making any call to the other endpoints outside of authentication, cookies must contain entries `access-token` and `refresh-token`.
1. Authorize user through Spotify's OAuth. For Spotistics, this is done directly on the frontend to receive a code. If done directly through backend, then URL to navigate to authorization page can be gotten from endpoint `/auth/loginPageURL`. This endpoint REQUIRES query parameter `redirect` which takes a URL stub to redirect to after authentication is finished with the code in the URL's query parameter. For example, with endpoint `/auth/loginPageURL?redirect=http://localhost:3001/example?`, after authenticating through Spotify, users will return to `http://localhost:3001/example?code=1234`. Use `code` in the URL in the next step.

2. Redeem code for access and refresh tokens. Endpoint `/auth/redeemCode` can be used for this purpose. Simple include the query parameter `code` with the code gotten from before to get back the tokens used by Spotify. For example, calling endpoint `/auth/redeemCode?code=1234` will attempt to redeem code 1234 through Spotify and give back `{access-token, refresh-token}` if successful.

3. The backend server should automatically refreshes the `access-token` cookie when it expires (`access-token` is only valid for 1 hour but a new one can be gotten using `refresh-token`), but if you need to need to do this manually, then you can use endpoint `/auth/refreshToken`. You must include `refresh-token` in the cookies. You will get back `{access-token, refresh-token}` if successful.

## Getting Content/Data
### `/spotify/recommend`
For getting a list of tracks recommended by spotify. Up to 10 tracks.
- REQUIRES: `access-token` and `refresh-token` in cookies.
- Parameters: None for now
- Returns:
```
{
    recommendations: [
        {
            album: { // which album the track came from
                id,
                name,
                images, // array of image objects that includes urls to those images
                release_date, // date formatted time-stamp
                urls, // urls to go to that song's page
                artists // array of artist objects
            },
            track: { // the specific track
                id,
                name,
                duration, // in ms
                urls,
                artists,
                spotify_popularity, // spotify's own popularity rating from 0-100
                explicit, // boolean flag for whether its explicit content or not
                is_local_file // boolean flag for whether this song was stored and played from the user's device
            }
        }, ...
    ],
    items: <Number> // how many recommendations in the returned list
}
```

### `/spotify/user`
For getting the current user's profile information.
- REQUIRES: `access-token` and `refresh-token` in cookies.
- Parameters: None for now
- Returns: exactly what's found [here](https://developer.spotify.com/documentation/web-api/reference/get-current-users-profile)

### `/spotify/history`
For getting current user's listening history. Up to 50 of the most recent items.
- REQUIRES: `access-token` and `refresh-token` in cookies.
- Parameters: None for now
- Returns:
```
{
    history: [
        {
            album: { // which album the track came from
                id,
                name,
                images, // array of image objects that includes urls to those images
                release_date, // date formatted time-stamp
                urls, // urls to go to that song's page
                artists // array of artist objects
            },
            track: { // the specific track
                id,
                name,
                duration, // in ms
                urls,
                artists,
                spotify_popularity, // spotify's own popularity rating from 0-100
                explicit, // boolean flag for whether its explicit content or not
                is_local_file // boolean flag for whether this song was stored and played from the user's device
            },
            played_at: // date formatted time-stamp of when this song started playng
        }, ...
    ],
    items: <Number> // how many tracks in the returned list
}