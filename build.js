const webpack = require('webpack')
const webpackConfig = require('./webpack.conf.js')
const fs = require('fs')
const getFolderSize = folder => {
    const files = fs.readdirSync(folder)
    let size = 0
    files.forEach(file => {
        const stats = fs.statSync(`${folder}/${file}`)
        size += stats.size
    })
    return size
}
/* build out the src folder into a folder called static and an index.html with links to the compiled files. */
webpack(webpackConfig, (err, stats) => {
    if (err) {
        console.log(err.stack || err)
        if (err.details) {
            console.log(err.details)
        }
        return
    }
    const info = stats.toJson()
    if (stats.hasErrors()) {
        console.log(info.errors)
    }
    if (stats.hasWarnings()) {
        console.log(info.warnings)
    }
    console.log(stats.toString({
        chunks: false,
        colors: true
    }))
    console.log(getFolderSize('./static'), 'bytes total')
})