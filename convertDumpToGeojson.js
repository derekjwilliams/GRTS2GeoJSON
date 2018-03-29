// 
var fs = require('fs')
var readline = require('readline')
var proj4 = require('./proj4j-src')
let result = {
  "type": "Feature",
  "geometry": {
    "type": "GeometryCollection",
    "geometries": []
  },
  "properties": {
    "name": "Continental US GRTS"
  }
}
proj4.defs('WGS84', "+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees");
const proj84 = '+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees"'
const proj3857 = 'PROJCS["WGS 84 / Pseudo-Mercator Geoserver",GEOGCS["WGS 84",DATUM["World Geodetic System 1984",SPHEROID["WGS 84",6378137.0,298.257223563,AUTHORITY["EPSG","7030"]],AUTHORITY["EPSG","6326"]],PRIMEM["Greenwich",0.0,AUTHORITY["EPSG","8901"]],UNIT["degree",0.017453292519943295],AXIS["Geodetic longitude",EAST],AXIS["Geodetic latitude",NORTH],AUTHORITY["EPSG","4326"]],PROJECTION["Popular Visualisation Pseudo Mercator",AUTHORITY["EPSG","1024"]],PARAMETER["semi_minor",6378137.0],PARAMETER["latitude_of_origin",0.0],PARAMETER["central_meridian",0.0],PARAMETER["scale_factor",1.0],PARAMETER["false_easting",0.0],PARAMETER["false_northing",0.0],UNIT["m",1.0],AXIS["Easting",EAST],AXIS["Northing",NORTH],AUTHORITY["EPSG","3857"]]'
const esri = 'PROJCS["WGS 84 / Pseudo-Mercator",GEOGCS["GCS_WGS_1984",DATUM["D_WGS_1984",SPHEROID["WGS_1984",6378137,298.257223563]],PRIMEM["Greenwich",0],UNIT["Degree",0.017453292519943295]],PROJECTION["Mercator"],PARAMETER["central_meridian",0],PARAMETER["scale_factor",1],PARAMETER["false_easting",0],PARAMETER["false_northing",0],UNIT["Meter",1]]'

let instream = fs.createReadStream('full14.csv');
instream.on('end', () => { ended = true });
var ended = false
var lineReader = readline.createInterface({
  input: instream
});
let pos = 0
let globalMaxX = -100000000
let globalMinX = 100000000
let globalWidth = 10000000
lineReader.on('line', function (line) {
  const sl = line.split(',')
  const id = sl[0]
  const grtsCellId = sl[1]
  const b = line.split(',', 2).join(',').length + 1
  let polygonString = line.substring(b).replace(/\\/g, '')

  polygonString = line.substr(b).replace(/\\/g, '')
  const polygon = JSON.parse(polygonString)
  const corners = []
  let minX = 100000000
  let maxX = -100000000
  let minY = 100000000
  let maxY = -100000000

  for (let i = 0; i < polygon.coordinates[0].length; i++) {
    // console.log(i)
    // console.log(JSON.stringify(polygon.coordinates[0][i]))
    if (polygon.coordinates[0][i][0] >= globalMaxX) {
      globalMaxX = polygon.coordinates[0][i][0]
    }
    if (polygon.coordinates[0][i][0] <= globalMinX) {
      globalMinX = polygon.coordinates[0][i][0]
    }
    if (polygon.coordinates[0][i][0] >= maxX) {
      maxX = polygon.coordinates[0][i][0]
    }
    if (polygon.coordinates[0][i][0] <= minX) {
      minX = polygon.coordinates[0][i][0]
    }
    if (polygon.coordinates[0][i][1] >= maxY) {
      maxY = polygon.coordinates[0][i][1]
    }
    if (polygon.coordinates[0][i][1] <= minY) {
      minY = polygon.coordinates[0][i][1]
    }
    // if (i > 0) {

    //   console.log('delta y:' + Math.abs(polygon.coordinates[0][i][1] - polygon.coordinates[0][i-1][1]))
    //   console.log('delta x:' + Math.abs(polygon.coordinates[0][i][0] - polygon.coordinates[0][i-1][0]))
    //   // console.log('delta y:' + (polygon.coordinates[0][i][1] - polygon.coordinates[0][i-1][1]))
    // }
  }

  // console.log('\n maxX: ' + maxX)
  // console.log('\n minX: ' + minX)
  // console.log('\n maxY: ' + maxY)
  // console.log('\n minY: ' + minY)
  for (let i = 0; i < polygon.coordinates[0].length; i++) {
    if (polygon.coordinates[0][i][0] === maxX) {
      corners.push(i)
    }
    if (polygon.coordinates[0][i][0] === minX) {
      corners.push(i)
    }
    if (polygon.coordinates[0][i][1] === maxY) {
      corners.push(i)
      // console.log('\n i for maxY: ' + i)
    }
    if (polygon.coordinates[0][i][1] === minY) {
      corners.push(i)
      // console.log('\n i for minY: ' + i)
    }
  }
  // console.log('corners ' + JSON.stringify(corners))
  const cornerPoints = []
  for (let i = 0; i < corners.length; i++){
    cornerPoints.push(polygon.coordinates[0][corners[i]])  
  }
  // silly trapizoid handling, fix this
  cornerPoints.push(polygon.coordinates[0][corners[0]]) 
  if (!(maxX > -10682238.0062 && maxX < -10669380.1429)) {
    polygon84 = {"type" : "Polygon", "coordinates": [cornerPoints.map(v => proj4(proj3857, proj84, v))]}
  } else {
    polygon84 = {"type" : "Polygon", "coordinates": [polygon.coordinates[0].map(v => proj4(proj3857, proj84, v))]}
  }
    //   "bbox": [0, 12.469025989284091, 1142.7924311762474, 900],
    // "transform":
    // {
    //     "scale": [0.009995801851947097, -0.005844667153098606],
    //     "translate": [0, 600]
    // },

  // if (maxX > -10682238.0062 && maxX < -10669380.1429) {
//  if (maxX > -10816523.7205248 && maxX < -10616523.7205248) {
    // console.log(id)
    // console.log(JSON.stringify(polygon.coordinates[0]))
    // pos++
    // if (pos % 1000 === 0) {
    //   console.log(pos)
    // }

    // const z = [polygon.coordinates[0].map(v => proj4(proj3857, proj84, v))]
    // console.log(`\npoints: ${JSON.stringify(z)}`)
    // const polygon840 = {"type" : "Polygon", "coordinates": z}
    // const polygon841 = {"type" : "Polygon", "coordinates": [polygon.coordinates[0].map(v => proj4(proj3857, proj84, v))]}
    // console.log('\n 84: ' + JSON.stringify(polygon84) )
    // console.log('\n 840: ' + JSON.stringify(polygon840) )
    // console.log('\n 841: ' + JSON.stringify(polygon841) )
    result.geometry.geometries.push(polygon84)
  // }
});

instream.on('end', () => { 
  console.log('maxX: ' + globalWidth)
  fs.writeFile('fulldec14z.json', JSON.stringify(result,null,1), (error) => { /* handle error */ })
});
