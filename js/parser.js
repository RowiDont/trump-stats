const csv = require('csv-parse')
const fs = require('fs')

module.exports = {
  parseCsv: function(metrics) {
    return new Promise(function(resolve, reject) {
      const fileName = `${process.cwd()}/assets/obama.csv`;

      fs.readFile(fileName, (err, data) => {
        if (err) reject(err)

        csv(data, {}, (err, data) => {
          if (err) reject(err)

          resolve(data)
        })
      })
    })
  }
}