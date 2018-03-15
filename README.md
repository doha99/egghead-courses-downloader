# egghead-courses-downloader
Download videos from a specific course of egghead.io.
This is pure javascript version for nodejs. 
And it is ported from the exists the repo (https://github.com/markbrown4/egghead-downloader).
If you know coffee script, please take a look at it.

# how to use?
You must install nodejs first, then:

1. clone this project
2. copy .env.example to .env, and edit EMAIL, PASSWORD
3. open terminal and type

`yarn install`

or 

`npm install`

4. type command to download

`yarn download --url [egghead course url]`

or 

`npm download --url [egghead course url]`