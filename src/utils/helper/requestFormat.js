const HttpError = require("@utils/error/http-error")

const addAuthToken = (req, options) => {
    if (!(req.cookies && req.cookies["access_token"])) throw new HttpError(401, "No access token given", 100)
    return {
        ...options,
        headers: {
            ...options.headers,
            Authorization: 'Bearer ' + req.cookies["access_token"]
        }
    }
}



module.exports = {
    addAuthToken,
}