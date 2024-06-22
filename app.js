const express = require('express')
const app = express()
const got = require('got')
const cheerio = require('cheerio')

const port = process.env.PORT || 3000

/**
 * Single image map
 * @param mapnode html \<map\> node to parse
 * @param day required for target generation
 */
class mapObject {
    constructor(mapnode, day) {
        this.coordsv = mapnode['attribs']['coords']
        this.targetv = mapnode['attribs']['onclick']
        this.day = day
    }

    get coords() {
        return this.coordsv
    }

    get target() {
        let pt = this.targetv
        return this.getTarget(pt)
    }

    //some regex
    getTarget(pt) {
        let sane = pt.match(/\'[0-9]*\'/g)
        let id = sane[0].replace(/\'/g, "")
        let tab = sane[1].replace(/\'/g, "")
        let ver = sane[2].replace(/\'/g, "")
        let day = this.day
        return `/imageview_${id}_${tab}_${ver}_71_${day}_0_i_1_sf.html`
    }
}

/**
 * 
 * @param {Response} res 
 * @param {String} day 
 * @param {String} url 
 * Main request method.
 */
function getReq(res, day, url) {
    got(url).then(res_s => {
        const $ = cheerio.load(res_s.body)
        simages = $(".shadowimage")
        pages = []
        maps=[]
        for (i =0; i < simages.length; i++) {
            pages.push(simages[i]['attribs']['src'])
            let m1 = "map[name=" + simages[i]['attribs']['usemap'].replace('#', '') + "]"
            let map = []
            let cmap = $(m1).children('map').children('area')
            for (j=0; j < cmap.length; j++) {
                map.push(new mapObject(cmap[j], day))
            }
            maps.push(map)
        }
        jsostack = {}
        for (i = 0; i < pages.length; i++) {
            let n = []
            let p = []
            for (j = 0; j < maps[i].length; j++) {
                n.push(maps[i][j].target)
                p.push(maps[i][j].coords)
            }
            let m = {id:i, src:pages[i], target:n, coord:p}
            jsostack[i] = m

        }
        res.header('content-type', 'application/json')
        res.send(jsostack)
    })
}

app.get('/', (req, res) => {
    console.log("init request");
    res.sendFile('app.html', {root: "frontend/"});
})

// static vesion
app.get('/c', (req, res) => {
    res.sendFile('appc.html', {root: "frontend/"});
})

app.use(express.static("frontend"))

/**
 * the day managemeny
 * TODO not implemented in frontend yet
 */
app.get('/json', (req, res) => {
    let urlday = new URLSearchParams(req.url).get("day")
    let currday = new Date().toJSON().slice(0,10).split('-').reverse().join('-')
    day = urlday || currday
    url = 'https://epaper.anandabazar.com/'
    if (day != currday) {
        md = day.split('-')
        nday = `${md[2]}-${Number(md[1]).toString()}-${Number(md[0]).toString()}`
        url = url + `calcutta/${nday}/71/Page-1.html`
    }
    getReq(res, day, url)
    //res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`app listening at ${port}`)
})
