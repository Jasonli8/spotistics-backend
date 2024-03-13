var request = require('request');
var crypto = require('crypto');
var querystring = require('querystring');

// reference: https://developer.spotify.com/documentation/web-api/tutorials/code-flow
var client_id = '99c4249a81b040bfac0b3146288a64b7';
var client_secret = '2c0eb3dc48b04c6e9dabb9ef04df9866';
var redirect_uri = 'http://localhost:3000/auth/loginCallback';
var scope = [
	// may add playlist and other scopes later: https://developer.spotify.com/documentation/web-api/concepts/scopes
	"user-top-read", 			 // get Top Played
	"user-read-recently-played", // get Recently Played
]

const stateKey = "spotistics-auth-state"
const callbackRedirectKey = "spotistics-post-auth-redirect"

const generateRandomString = (length) => {
    return crypto
    .randomBytes(60)
    .toString('hex')
    .slice(0, length);
  }

const generateErrorResponse = () => {
	return {
		message: "Failed to claim new token",
		code: 101
	}
}

const login = async (req, res, next) => {
    // Return URL for app to direct user to Spotify's authorization page
    var state = generateRandomString(16);
    res.clearCookie(callbackRedirectKey);
    res.clearCookie(stateKey);
    res.cookie(callbackRedirectKey, req.query.redirect);
    res.cookie(stateKey, state);

    res.redirect(
        'https://accounts.spotify.com/authorize?' +
            querystring.stringify({
                response_type: 'code',
                client_id: client_id,
                scope: scope.join(" "),
                redirect_uri: redirect_uri,
                state: state,
                show_dialog: true // debugging
            })
    )
}

const loginCallback = async (req, res, next) => {
    // Universal landing page for after users finish authorization
    var code = req.query.code || null;
    var state = req.query.state || null;
    var storedState = req.cookies ? req.cookies[stateKey] : null;
    var storedRedirect = req.cookies ? req.cookies[callbackRedirectKey] : "http://localhost:3001/?" // TODO update default path
    console.log(req.cookies)

    if (state === null || state !== storedState) {
        res.redirect(storedRedirect + querystring.stringify({
            error: 102 // Client-server state mismatch
        }))
    } else {
        res.redirect(storedRedirect + querystring.stringify({ code }))
    }
}

const redeemCode = async (req, res, next) => {
    var code = req.query.code || null;
    var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
            code: code,
            redirect_uri: redirect_uri,
            grant_type: 'authorization_code'
        },
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            Authorization: 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
        },
        json: true
    };

    request.post(authOptions, function(error, response, body) {
        if (!error && response.statusCode === 200) {

            var access_token = body.access_token,
                refresh_token = body.refresh_token;

			res.status(200).send({access_token, refresh_token})

			// Example usage in API calls
            // var options = {
            // url: 'https://api.spotify.com/v1/me',
            // headers: { 'Authorization': 'Bearer ' + access_token },
            // json: true
            // };
            // request.get(options, function(error, response, body) {
            // console.log(body);
            // });
        } else {
			res.status(500).send(generateErrorResponse())
        }
    });
}

const refreshToken = async (req, res, next) => {
    var refresh_token = req.cookies.refresh_token;
    var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: { 
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))

        },
        form: {
            grant_type: 'refresh_token',
            refresh_token: refresh_token
        },
        json: true
    };

    request.post(authOptions, function(error, response, body) {
        if (!error && response.statusCode === 200) {
            var access_token = body.access_token,
                refresh_token = body.refresh_token;
            res.status(200).send({
                'access_token': access_token,
                'refresh_token': refresh_token
            });
        } else {
            console.log(error)
            console.log(response.body)
			res.status(500).send(generateErrorResponse())
		}
    });
}

module.exports = {
    login,
    loginCallback,
    redeemCode,
    refreshToken
}
