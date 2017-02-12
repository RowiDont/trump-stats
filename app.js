const express = require('express')
const fetch = require('node-fetch')
const parser = require('./js/parser.js')
const getObamaMetrics = require('./js/getObamaMetrics.js')

const app = express()

// DATA constants:
const metrics = {}

// Helper functions:
const handleError = (res, err) => {
  res.send(`So sorry, there's been an error: ${err}`)
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
  const results = getObamaMetrics(metrics.obama)
  response.send(results)
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
