var request = require('request').defaults({jar: true})
var config = require('../config')

function fetchHtmlPage(url) {
    if (config.debug) {
        console.log(`Fetching: ${url}`)
    }    
    return new Promise(function(resolve, reject) {
        request.get(url, function(err, response, body) {
            if (err) {      
                reject(err)
            }
            resolve({body, response})
        })
    })
}

module.exports = {
    fetchHtmlPage
}