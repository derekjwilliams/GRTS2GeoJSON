const fs = require("fs")
const csv = require("csvtojson")
const os = require('os')

class DataHandling {
    constructor(location) {
        this.location = location
    }
    sortCSV(column) {
        // input: GRTS/conus.csv //TODO add file or filename as function argument
        // output: GRTS/conus2.csv // TODO add file or filename as function argument
        // CONUS_10KM,lat,long,GRTS_ID //TODO allow for explicitly reading column names
        csv({checkType: true})
        .fromFile('../GRTS/conus.csv')
        .then(j => {
            j.sort((a,b) => a.CONUS_10KM - b.CONUS_10KM)
            const fw = fs.createWriteStream('../GRTS/conus_sorted.csv', {flags: 'w'})
            fw.write(`CONUS_10KM,lat,long,GRTS_ID${os.EOL}`)
            j.forEach(function(v){
                fw.write(`${Object.values(v).toString()}${os.EOL}`)
            })
            fw.end()

        //     fs.writeFile('../GRTS/conus2.csv', JSON.stringify(j), 'utf8', function (err) {
        //         if (err) {
        //             return console.log(err);
        //         }
            
        //         console.log("The file was saved!");
        //     })
        //     console.log(j)
        })
    }
}

const handler = new DataHandling('conus')
handler.sortCSV()
