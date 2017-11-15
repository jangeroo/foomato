const app = require('express')()
// const backend = require('./mock-backend.js')
const backend = require('./firebase-backend.js')

app.set('port', (process.env.PORT || 5000));

app.listen(app.get('port'), function () {
    console.log('fOOmenu-zomato listening on port', app.get('port'))
})

app.get('/', (req, res) => {

    res.send('fOOmenu-zomato, up and running:')
})
