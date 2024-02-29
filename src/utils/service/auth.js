var request = require('request');
var crypto = require('crypto');
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');

// reference: https://developer.spotify.com/documentation/web-api/tutorials/code-flow
var client_id = 'dcb7c8ef25dd48c2b832fd73164d9f4c';
var client_secret = '33a2d7d25dd04ef5a2c16544d850830d';
var redirect_uri = 'http://localhost:3000/auth/callback'; // Your redirect uri TODO add to spotify dev allow list
var scope = [
	// may add playlist and other scopes later: https://developer.spotify.com/documentation/web-api/concepts/scopes
	"user-top-read", 			 // get Top Played
	"user-read-recently-played", // get Recently Played
]

const stateKey = "spotistics-auth-state"

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
    // User login and authorization
	// Checking if user is authorized done by Spotify's API

    var state = generateRandomString(16);
    res.cookie(stateKey, state);
  
    res.redirect('https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        response_type: 'code',
        client_id: client_id,
        scope: scope.join(" "),
        redirect_uri: redirect_uri,
        state: state
    }));
}

const loginCallback = async (req, res, next) => {
    // After login redirects, user logs in and authorizes through Spotify's OAuth interface
	// After user completes OAuth step, redirects here to continue
	// If authorization successful, redeems given code for session token and a refresh token

    var code = req.query.code || null;
    var state = req.query.state || null;
    var storedState = req.cookies ? req.cookies[stateKey] : null;

    if (state === null || state !== storedState) {
        res.status(500).send({message: "Client-server state mismatch", code: 102})
    } else {
        res.clearCookie(stateKey);
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
}

const refreshToken = async (req, res, next) => {
    var refresh_token = req.query.refresh_token;
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
			res.status(500).send(generateErrorResponse())
		}
    });
}

module.exports = {
    login,
    loginCallback,
    refreshToken
}
