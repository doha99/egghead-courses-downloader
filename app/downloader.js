var config = require('../config')
var fetcher = require('./fetcher')
var cheerio = require('cheerio')
var fs = require('fs')
var async = require('async')
var path = require('path')
var request = require('request')

function fetchLinks(url, courseName) {
    return fetcher.fetchHtmlPage(url)
        .then(({ body , response }) => {
            if (response.statusCode !== 200) {
                return []
            }

            var lessonList = JSON.parse(body)
            if (lessonList.length == 0 || !lessonList[0].download_url) {
                console.error('Should to login first')
                return { lessons: [], courseName }
            }

            var lessons = lessonList.map((lessonObject, index) => {
                return {
                    href: lessonObject.download_url,
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
            lesson.downloadLink = body
            callback(null, lesson)
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
    var parts = url.split('/')
    var courseName = parts[parts.length - 1]
    url = url.replace('egghead.io/', 'egghead.io/api/v1/') + '/lessons'
    url = url.replace('/courses/', '/series/')
    console.log(`lessons url = ${url}`)
    console.log(`course name = ${courseName}`)
    fetchLinks(url, courseName)
        .then(({lessons, courseName}) => {
            if (lessons.length == 0) return

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
