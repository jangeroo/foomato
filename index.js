const app = require('express')()
const cors = require('cors')
const bodyParser = require('body-parser')

app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))

// const backend = require('./mock-backend.js')
const backend = require('./firebase-backend.js')

app.set('port', (process.env.PORT || 5000));
app.listen(app.get('port'), function () {
  console.log('fOOmenu-zomato listening on port', app.get('port'))
})

app.get('/', (req, res) => {
  let response = {
    API_name: 'Foomato',
    description: 'A Zomato clone',
    backend: backend.module_name
  }
  res.send(response)
})


/* ZOMATO RESTAURANT DATA MODEL
let resto = {
  "id": "16774318",
  "name": "Otto Enoteca & Pizzeria",
  "location": {
    "latitude": "40.732013",
    "longitude": "-73.996155"
  },
  "cuisines": "Cafe"
}
*/
app.get('/restaurant', async (req, res) => {

  let restaurants = await backend.getRestaurants();
  let response = []

  if (req.query.res_id) {
    if (!restaurants[req.query.res_id]) {
      response = {
        "code": 404,
        "status": "Not Found",
        "message": `No restaurant matching res_id: ${req.query.res_id}`
      }
    }
    else {
      resto = restaurants[req.query.res_id]
      response.push({
        id: req.query.res_id,
        name: resto.name,
        location: resto.location
      })
    }
  }
  else {
    for (let restoID in restaurants) {
      response.push({
        id: restoID,
        name: restaurants[restoID].name,
        location: restaurants[restoID].location
      })
    }
  }
  res.json(response);

})

app.post('/restaurant', async (req, res) => {
  if (!req.body.name || !req.body.latitude || !req.body.longitude) {
    res.json({
      "code": 400,
      "status": "Bad Request",
      "message": "Missing name, latitude or longitude"
    })
  }
  else {
    let restoID = await backend.createRestaurant(req.body.name, req.body.latitude, req.body.longitude)
    let restaurants = await backend.getRestaurants()
    res.json(restaurants[restoID])
  }
})

/* ZOMATO DAILY MENU DATA MODEL
{
  "daily_menu": [
    {
      "dishes": [
        {
          "dish_id": "104089345",
          "name": "Tatarák ze sumce s toustem",
          "price": "149 Kč"
        }
      ]
    }
  ]
}
*/
app.get('/dailymenu', (req, res) => {

  let restaurants = backend.getRestaurants();
  let response = []

  if (req.query.res_id) {
    if (!restaurants[req.query.res_id]) {
      response = {
        "code": 404,
        "status": "Not Found",
        "message": `No restaurant matching res_id: ${req.query.res_id}`
      }
    }
    else {
      response = {
        "daily_menu": [
          { "dishes": [] }
        ]
      }
      restaurants[req.query.res_id].menu.forEach(item => {
        response.daily_menu[0].dishes.push(
          {
            dish_id: item.dish_id,
            name: item.burgerName,
            price: item.price
          }
        )
      })
    }
  }
  else {
    response = {
      "code": 400,
      "status": "Bad Request",
      "message": "No Restaurant ID provided"
    }
  }

  res.json(response);

})

app.post('/dailymenu', (req, res) => {
  let response = [];
  if (!req.body.res_id || !req.body.name || !req.body.price) {
    res.json({
      "code": 400,
      "status": "Bay Request",
      "message": "Missing res_id, name or price"
    })
  }
  else {
    let dishID = backend.createDish(req.body.res_id, req.body.name, req.body.price)
    let restaurants = backend.getRestaurants();

    restaurants[req.body.res_id].menu.forEach(dish => {
      if (dish.dish_id == dishID) response = dish
    })
    res.json(response);
  }
})