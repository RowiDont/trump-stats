const express = require('express')
const fetch = require('node-fetch')
const parser = require('./js/parser.js')
const getObamaMetricsForToday = require('./js/getObamaMetrics.js')

const app = express()

// DATA constants:
const metrics = {}

// Helper functions:
const handleError = (err) => {
  res.send(`So sorry, there's been an error: ${err}`)
}

// Data processing and fetching:
const fetchAndSetTrumpMetrics = () =>
  fetch('https://elections.huffingtonpost.com/pollster/api/v2/charts/trump-job-approval')
    .then(response => response.json())
    .then(json => {
      metrics.trump = json.pollster_estimates[0].values.hash
    })

const setObamaMetrics = () => parser.parseCsv(metrics)


// Render data:
const render = (response, data) => {
  response.send(data.obama.length.toString())
}

// Routing:
app.get('/', function (req, res) {
  if (metrics.trump && metrics.obama) {
    render(res, metrics)
  } else {
    fetchAndSetTrumpMetrics()
    .then(parser.parseCsv(metrics)
      .then(data => { metrics.obama = data; })
      .catch(handleError)
    )
    .then(() => render(res, metrics))
    .catch(handleError)
  }
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
