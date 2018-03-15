
var program = require('commander')
var version = require('../package.json').version

program
  .version(version, '-v, --version')
  .option('--url <url>', 'Course url')
  .parse(process.argv);

if (! program.url) {
    console.error('URL is invalid')
    return
}

var login = require('./login')
var downloader = require('./downloader')

login.postLogin()
    .then((res) => {
        if (res !== 'ok') {
            return
        }
        downloader.downloadCourse(program.url)
    })
    

