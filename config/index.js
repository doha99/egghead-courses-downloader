
var _ = require('lodash')
var envConfig = require('dotenv').config()

module.exports = {
    url : 'https://egghead.io',
    login_path: '/users/sign_in',
    email: _.get(envConfig, 'parsed.EMAIL'),
    password: _.get(envConfig, 'parsed.PASSWORD'),
    debug: _.get(envConfig, 'parsed.DEBUG'),
}

