const express = require('express')
const { join } = require('path')
const { google } = require('googleapis')
const { authorize } = require('./libs/google-sheets')
const { registerEdge } = require('./libs/edge')

const auth = require('./middlewares/auth')
const registerParsers = require('./libs/parsers')

const port = 3000

const app = express()

registerEdge(app)
registerParsers(app)

app.use('/assets', express.static(join(__dirname, 'assets')))
app.use(auth)

app.get('/', async (req, res) => {

  authorize().then(async auth => {
    const sheets = google.sheets({ version: 'v4', auth });
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: '16jJ9UVvFse3Teid6yKQU36zU9oyNfl7U_xhQQIHMwtE',
      range: 'Products!A2:G',
    });

    rows = res.data.values;

  }).then(() => {
    res.render('home', { rows })
  })

})

app.put('/product/:id', (req, res) => {
  authorize().then(async auth => {
    const sheets = google.sheets({ version: 'v4', auth });
    const response = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: '16jJ9UVvFse3Teid6yKQU36zU9oyNfl7U_xhQQIHMwtE',
      resource: {
        "requests":
          [
            {
              "updateSpreadsheetProperties": {
                "properties": {
                  "sheetId": 0,
                  "dimension": "ROWS",
                  "startIndex": rowIndex,
                  "endIndex": rowIndex + 1
                }
              }
            }
          ]
      }
    })
    if (response) {
      res.send({ deleted: true })
    }
  })
})

app.delete('/product/:id', (req, res) => {
  let rowIndex = parseInt(req.params.id)
  authorize().then(async auth => {
    const sheets = google.sheets({ version: 'v4', auth });
    const response = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: '16jJ9UVvFse3Teid6yKQU36zU9oyNfl7U_xhQQIHMwtE',
      resource: {
        "requests":
          [
            {
              "deleteDimension": {
                "range": {
                  "sheetId": 0,
                  "dimension": "ROWS",
                  "startIndex": rowIndex,
                  "endIndex": rowIndex + 1
                }
              }
            }
          ]
      }
    })
    if (response) {
      res.send({ deleted: true })
    }
  })
})

app.post('/login', (req, res) => {
  let rows = []

  authorize().then(async auth => {
    const sheets = google.sheets({ version: 'v4', auth });
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: '16jJ9UVvFse3Teid6yKQU36zU9oyNfl7U_xhQQIHMwtE',
      range: 'Users!A2:B',
    });

    rows = res.data.values;

  }).then(() => {
    let isAuth = rows.find(credential => {
      return credential.includes(req.body.email) && credential.includes(req.body.password)
    })

    if (isAuth) {
      req.session.auth = {
        email: req.body.email,
        password: req.body.password
      }
      res.redirect('/')
    }

    else {
      req.flash('errors', 'Credentials is incorrect!')
      res.redirect('back')
    }
  })
})

app.get('/login', (req, res) => {
  res.render('login', { errors: req.flash('errors') })
})

app.post('/logout', (req, res) => {
  req.session.auth = null
  res.redirect('/login')
})

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})