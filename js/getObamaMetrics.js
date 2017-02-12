const moment = require('moment')

function findMetric (collection, label, date) {
  return collection.find(array => (array[0] === label && array[1] === date))
}

function getObamaMetrics (collection) {
  let results = []
  let date = moment().subtract(8, 'years')
  let count = 0
  const dateString = (date) => date.format('YYYY-MM-DD')

  while (count < 10 && (!results[0] || !results[1])) {
    results = [
      findMetric(collection, 'Approve', dateString(date)),
      findMetric(collection, 'Disapprove', dateString(date))
    ]

    date = date.subtract(1, 'days')
    count++
  }

  if (count === 10) results = 'Could not find results'

  return results
}

module.exports = getObamaMetrics

// Columns:
//     0       1      2      3      4
// ["label","date","value","low","high"]
