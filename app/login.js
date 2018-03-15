var request = require('request').defaults({jar: true})
var cheerio = require('cheerio')
var _ = require('lodash')
var config = require('../config')
var fetcher = require('./fetcher')

function getCsrfToken(url) {
    return fetcher.fetchHtmlPage(url)
        .then(function(res) {
            var statusCode = _.get(res.response, 'statusCode', -1);
            console.debug(`statusCode = ${statusCode}`)
            if (statusCode === 200) {
                $ = cheerio.load(res.body)
                var token = $('meta[name=csrf-token]').attr('content')
                console.log(`Received token = ${token}`)
                return token
            } else {
                console.log(`Cannot fetch the page, return status code = ${statusCode}`)
            }
        }, err => {
            console.log(err)
        })
}

function postLogin() {
    console.log(`Start to login with ${config.email}`)
    var loginUrl = config.url + config.login_path
    
    return getCsrfToken(loginUrl)
        .then(token => {
            if (!token) return

            var promise = new Promise((resolve, reject) => {
                request({
                    method: 'POST',
                    uri: loginUrl,
                    form: {
                        'authenticity_token': token,
                        'user[email]': config.email,
                        'user[password]': config.password,
                    },
                    simple: false
                }, function(err, response, body) {
                    if (err) {
                        console.log(err)
                    } 
                    else if (response && response.statusCode === 302) {
                        console.log('Login successfully.')
                        resolve('ok')
                    }
                })
            })

            return promise            
        })
}

module.exports = {
    postLogin
}