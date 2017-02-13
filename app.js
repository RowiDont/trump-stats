const express = require('express')
const fetch = require('node-fetch')
const parser = require('./js/parser.js')
const getObamaMetrics = require('./js/getObamaMetrics.js')

const app = express()
app.set('view engine', 'ejs')

// DATA constants:
const metrics = {}

// Helper functions:
const handleError = (res, err) => {
  res.send(`So sorry, there's been an error: ${err}`)
}

const round = function (number, precision) {
  const factor = Math.pow(10, precision)
  const tempNumber = number * factor
  const roundedTempNumber = Math.round(tempNumber)
  return roundedTempNumber / factor
}

// Data processing and fetching:
const fetchAndSetTrumpMetrics = () =>
  fetch('https://elections.huffingtonpost.com/pollster/api/v2/charts/trump-job-approval')
    .then(response => response.json())
    .then(json => {
      metrics.trump = json.pollster_estimates[0].values.hash
    })

// Render data:
const render = (response) => {
  const obamaNumbers = getObamaMetrics(metrics.obama)

  const approve = {
    trump: round(metrics.trump.Approve, 1),
    obama: round(obamaNumbers[0][2], 1)
  }

  const disapprove = {
    trump: round(metrics.trump.Disapprove, 1),
    obama: round(obamaNumbers[1][2], 1)
  }

  const biggest = {
    trump: approve.trump > disapprove.trump ? 'approve' : 'disapprove',
    obama: approve.obama > disapprove.obama ? 'approve' : 'disapprove'
  }

  response.render('index', { approve, disapprove, biggest })
}

// Routing:
app.get('/', function (req, res) {
  if (metrics.trump && metrics.obama) {
    render(res)
  } else {
    fetchAndSetTrumpMetrics()
    .then(
      parser.parseCsv(metrics)
      .then(data => { metrics.obama = data })
      .catch(err => handleError(res, err))
    )
    .then(() => render(res))
    .catch(err => handleError(res, err))
  }
})

const serverPort = process.env.PORT || 3000

app.listen(serverPort, () => { console.log(`Server listening on port ${serverPort}`) })
