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
//298.257223563

const proj3857 = 'PROJCS["WGS 84 / Pseudo-Mercator Geoserver",GEOGCS["WGS 84",DATUM["World Geodetic System 1984",SPHEROID["WGS 84",6378137.0,298.257223563,AUTHORITY["EPSG","7030"]],AUTHORITY["EPSG","6326"]],PRIMEM["Greenwich",0.0,AUTHORITY["EPSG","8901"]],UNIT["degree",0.017453292519943295],AXIS["Geodetic longitude",EAST],AXIS["Geodetic latitude",NORTH],AUTHORITY["EPSG","4326"]],PROJECTION["Popular Visualisation Pseudo Mercator",AUTHORITY["EPSG","1024"]],PARAMETER["semi_minor",6378137.0],PARAMETER["latitude_of_origin",0.0],PARAMETER["central_meridian",0.0],PARAMETER["scale_factor",1.0],PARAMETER["false_easting",0.0],PARAMETER["false_northing",0.0],UNIT["m",1.0],AXIS["Easting",EAST],AXIS["Northing",NORTH],AUTHORITY["EPSG","3857"]]'
const albersUSA = 'PROJCS["USA_Contiguous_Albers_Equal_Area_Conic_USGS_version",GEOGCS["GCS_North_American_1983",DATUM["D_North_American_1983",SPHEROID["GRS_1980",6378137.0,298.257222101]],PRIMEM["Greenwich",0.0],UNIT["Degree",0.0174532925199433]],PROJECTION["Albers"],PARAMETER["False_Easting",0.0],PARAMETER["False_Northing",0.0],PARAMETER["Central_Meridian",-96.0],PARAMETER["Standard_Parallel_1",29.5],PARAMETER["Standard_Parallel_2",45.5],PARAMETER["Latitude_Of_Origin",23.0],UNIT["Meter",1.0]]'
//const albersUSA = 'PROJCS["USA_Contiguous_Albers_Equal_Area_Conic_USGS_version",GEOGCS["GCS_North_American_1983",DATUM["D_North_American_1983",SPHEROID["GRS_1980",6378137.0,298.257223563]],PRIMEM["Greenwich",0.0],UNIT["Degree",0.017453292519943295]],PROJECTION["Albers"],PARAMETER["False_Easting",0.0],PARAMETER["False_Northing",0.0],PARAMETER["Central_Meridian",-96.0],PARAMETER["Standard_Parallel_1",29.5],PARAMETER["Standard_Parallel_2",45.5],PARAMETER["Latitude_Of_Origin",23.0],UNIT["Meter",1.0]]'
//const esri = 'PROJCS["WGS 84 / Pseudo-Mercator",GEOGCS["GCS_WGS_1984",DATUM["D_WGS_1984",SPHEROID["WGS_1984",6378137,298.257223563]],PRIMEM["Greenwich",0],UNIT["Degree",0.017453292519943295]],PROJECTION["Mercator"],PARAMETER["central_meridian",0],PARAMETER["scale_factor",1],PARAMETER["false_easting",0],PARAMETER["false_northing",0],UNIT["Meter",1]]'
//const proj3857 = 'PROJCS["WGS 84 / Pseudo-Mercator Geoserver",GEOGCS["WGS 84",DATUM["World Geodetic System 1984",SPHEROID["WGS 84",6378137.0,298.257223563,AUTHORITY["EPSG","7030"]],AUTHORITY["EPSG","6326"]],PRIMEM["Greenwich",0.0,AUTHORITY["EPSG","8901"]],UNIT["degree",0.017453292519943295],AXIS["Geodetic longitude",EAST],AXIS["Geodetic latitude",NORTH],AUTHORITY["EPSG","4326"]],PROJECTION["Popular Visualisation Pseudo Mercator",AUTHORITY["EPSG","1024"]],PARAMETER["semi_minor",6378137.0],PARAMETER["latitude_of_origin",0.0],PARAMETER["central_meridian",0.0],PARAMETER["scale_factor",1.0],PARAMETER["false_easting",0.0],PARAMETER["false_northing",0.0],UNIT["m",1.0],AXIS["Easting",EAST],AXIS["Northing",NORTH],AUTHORITY["EPSG","3857"]]'
// const albersUSA = 'PROJCS["USA_Contiguous_Albers_Equal_Area_Conic_USGS_version",GEOGCS["GCS_North_American_1983",DATUM["D_North_American_1983",SPHEROID["GRS_1980",6378137.0,298.257222101]],PRIMEM["Greenwich",0.0],UNIT["Degree",0.0174532925199433]],PROJECTION["Albers"],PARAMETER["False_Easting",0.0],PARAMETER["False_Northing",0.0],PARAMETER["Central_Meridian",-96.0],PARAMETER["Standard_Parallel_1",29.5],PARAMETER["Standard_Parallel_2",45.5],PARAMETER["Latitude_Of_Origin",23.0],UNIT["Meter",1.0]]'
const proj84 = '+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees"'

let instream = fs.createReadStream('full14.csv');
instream.on('end', () => { ended = true });
var ended = false
let count = 0
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
  
  // silly trapizoid handling, fix this
  const corners = []
  let minX = 100000000
  let maxX = -100000000
  let minY = 100000000
  let maxY = -100000000

  for (let i = 0; i < polygon.coordinates[0].length; i++) {
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
  }


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

  cornerPoints.push(polygon.coordinates[0][corners[0]]) 

  // albersUSA
  // was proj84
  count++
  if (count < 270) {
  if (!(maxX > -10682238.0062 && maxX < -10669380.1429)) {
    // polygon84 = {"type" : "Polygon", "coordinates": [cornerPoints.map(v => proj4(proj3857, albersUSA, v))]}
    polygon84 = {"type" : "Polygon", "coordinates": [cornerPoints.map(v => {
      // console.log(v)
      const va = proj4(proj3857, albersUSA, v)
      return [Math.round(va[0]*1000)/1000, Math.round(va[1]*1000)/1000] // round to mm
    })]}
    if (!ended) {
      // console.log(JSON.stringify(polygon84))
      // ended = true
    }
  } else {
    polygon84 = {"type" : "Polygon", "coordinates": [polygon.coordinates[0].map(v => proj4(proj3857, albersUSA, v))]}
  }

    result.geometry.geometries.push(polygon84)
}});

instream.on('end', () => { 
  console.log('maxX: ' + globalWidth)
  fs.writeFile('fulldec14z_test.json', JSON.stringify(result,null,1), (error) => { /* handle error */ })
});
