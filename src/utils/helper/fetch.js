const request = require("request")
const HttpError = require("@utils/error/http-error")

const httpRequest = async (url, options) => {
    console.log(url)
    console.log(options)
    const response = await fetch(url, options)
    if (response.status != 200) {
        console.log(await response.json())
        throw new HttpError(response.status, response.message, 0)
    }
    return await response.json()
}

module.exports = {
    httpRequest
}