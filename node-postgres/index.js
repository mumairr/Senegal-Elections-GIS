const express = require('express')
const app = express()
const port = 3001

const model = require('./fetchRecords')

app.use(express.json())

app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Access-Control-Allow-Headers"
  );
  next();
});

app.get('/', (req, res) => {
  res.status(200).send('Main Page');
})

app.get('/boundary/:type', (req, res) => {
  model.getBoundary (req.params.type)
    .then(response => {
      res.status(200).send(response);
    })
    .catch(error => {
      res.status(500).send(error);
    })
})

app.get('/data/:type', (req, res) => {
  model.getData (req.params.type)
    .then(response => {
      res.status(200).send(response);
    })
    .catch(error => {
      res.status(500).send(error);
    })
})

app.get('/legend/:type', (req, res) => {
  model.getLegend (req.params.type)
    .then(response => {
      res.status(200).send(response);
    })
    .catch(error => {
      res.status(500).send(error);
    })
})

// app.delete('/merchants/:id', (req, res) => {
//   merchant_model.deleteMerchant(req.params.id)
//     .then(response => {
//       res.status(200).send(response);
//     })
//     .catch(error => {
//       res.status(500).send(error);
//     })
// })
app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})