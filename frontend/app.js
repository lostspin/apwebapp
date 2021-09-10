const loadJSON = (callback) => {
    const xObj = new XMLHttpRequest();
    xObj.open('GET', '/json', true);
    xObj.onreadystatechange = () => {
        if (xObj.readyState === 4 && xObj.status === 200) {
            callback(xObj.responseText);
        }
    };
    xObj.send(null);
  }
  
  const init = () => {
    loadJSON((response) => {
        const json = JSON.parse(response);
        for (i in json) {
            mkimg(json[i].id, json[i].src, json[i].target, json[i].coord)
        }
        s = document.createElement('script')
        // early loading will miss imgs and we do not know the number either
        s.src = "nav.js"
        document.getElementsByTagName("BODY")[0].appendChild(s)
    });
  }

init()
base = 'https://epaper.anandabazar.com'
alertcount = false

function mkimg(id, src, target, coord) {
    let img = document.createElement('img')
    img.src = base + src
    img.useMap = "#map" + id
    img.referrerPolicy = "no-referrer"
    // to get real dimens
    img.onload = () => {
        mkmap(id, target, coord, img.width, img.height)
    }
    img.onerror = () => {
        if (!alertcount) alert(`could not load ${id}. Reload`)
        alertcount = true
    }
    document.getElementsByClassName("container")[0].appendChild(img)

}

function mkmap(id, target, coord, width, height) {
    coord = updatedc(coord, width, height)
    let map = document.createElement('map')
    map.name = "map" + id
    for (i = 0; i < target.length; i++) {
        let a = document.createElement('area')
        a.coords = coord[i]
        a.shape = "rect"
        a.href = base + target[i]
        a.target = "_blank"
        map.appendChild(a)
    }
    document.getElementsByTagName("BODY")[0].appendChild(map)
}

/**
 * 
 * @param {Array<String>} coord 
 * @param {Number} width 
 * @param {Number} height 
 * @returns scaled coordinates
 */
function updatedc(coord, width, height) {
    nc = []
    rc = []
    mx = 0
    my = 0
    for (i = 0; i < coord.length; i++) {
        let mc = coord[i].split(',')
        mc[0] = parseInt(mc[0])
        mc[1] = parseInt(mc[1])
        mc[2] = parseInt(mc[2])
        mc[3] = parseInt(mc[3])
        if (mc[2] > mx) mx = mc[2]
        if (mc[3] > my) my = mc[3]
        nc.push(mc)
    }
    for (i = 0; i < coord.length; i++) {
        ncd = [nc[i][0]*width/mx, nc[i][1]*height/my, nc[i][2]*width/mx, nc[i][3]*height/my]
        rc.push(ncd)
    }
    return rc
}