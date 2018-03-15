var config = require('../config')
var fetcher = require('./fetcher')
var cheerio = require('cheerio')
var fs = require('fs')
var async = require('async')
var path = require('path')
var request = require('request')

function fetchLinks(url) {
    return fetcher.fetchHtmlPage(url)
        .then(({ body , response }) => {
            if (response.statusCode !== 200) {
                return []
            }
            $ = cheerio.load(body)

            if ($('a[href="/pricing?from=go-pro-nav"]').length > 0) {
                console.error('Should to login first')
                return []
            }

            var parts = url.split('/')
            var courseName = parts[parts.length - 1]

            var lessons = Array.from($('a[href*="/lessons/"][id]')).map((value, index) => {
                return {
                    href: config.url + $(value).attr('href'),
                    course: courseName,
                    index: ('0' + (index + 1)).substr(-2)
                }
            })

            return { lessons, courseName }
        })
}

function getVideoDetails(lesson, callback) {
    fetcher.fetchHtmlPage(lesson.href)
        .then(({ body, response }) => {
            if (response.statusCode !== 200) return;
            var $ = cheerio.load(body)
            var json = JSON.parse($('.js-react-on-rails-component').html())
            fetcher.fetchHtmlPage(json.lesson.download_url)
                .then(({ body }) => {
                    lesson.downloadLink = body
                    callback(null, lesson)
                })
        })
}

function downloadVideo(lesson, courseName, callback) {
    var href = lesson.downloadLink.split('?')[0]
    var parts = href.split('/')
    var filename = parts[parts.length - 1]

    // console.log(filename)
    // console.log(lesson.downloadLink)
    // return callback(null)

    var streamWriter = fs.createWriteStream(path.join(__dirname, '../downloads/' + courseName + '/' + filename))
    streamWriter.on('finish', () => {
        console.log(`downloaded ${filename}.`)
        callback(null)
    }).on('error', (err) => {
        callback(err)
    })
    request(lesson.downloadLink).pipe(streamWriter)
}

function downloadCourse(url) {
    var folderPath = path.join(__dirname, '../downloads')
    if (! fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath)
    }
    fetchLinks(url)
        .then(({lessons, courseName}) => {
            var tasks = lessons.map((lesson) => {
                return function(callback) {
                    getVideoDetails(lesson, callback)
                }                
            })
            var folderPath = path.join(__dirname, '../downloads/' + courseName)
            if (! fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath)
            }
            async.series(tasks, function(err, results) {
                var tasks = results.map((lesson) => {
                    return function(callback) {
                        downloadVideo(lesson, courseName, callback)
                    }
                })
                async.parallelLimit(tasks, 1, function(err) {
                    if (err) {
                        console.log(err)
                    } else {
                        console.log('downloaded them all!!!');
                    }
                })
            })
        })
}

module.exports = {
    fetchLinks,
    downloadCourse
}