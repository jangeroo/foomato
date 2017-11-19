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
      response = {
        id: req.query.res_id,
        name: resto.name,
        location: resto.location
      }
    }
  }
  else {
    for (let res_id in restaurants) {
      response.push({
        id: res_id,
        name: restaurants[res_id].name,
        location: restaurants[res_id].location
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
    let res_id = await backend.createRestaurant(req.body.name, req.body.latitude, req.body.longitude)
    let restaurants = await backend.getRestaurants()
    let resto = restaurants[res_id]
    resto.id = res_id
    res.json(resto)
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
app.get('/dailymenu', async (req, res) => {

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
      response = {
        "daily_menu": [
          { "dishes": [] }
        ]
      }
      let menu = restaurants[req.query.res_id].menu
      for (let dish_id in menu) {
        response.daily_menu[0].dishes.push({
          dish_id,
          name: menu[dish_id].burgerName,
          price: menu[dish_id].price
        })
      }
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

app.post('/dailymenu', async (req, res) => {
  let response = [];
  if (!req.body.res_id || !req.body.name || !req.body.price) {
    res.json({
      "code": 400,
      "status": "Bay Request",
      "message": "Missing res_id, name or price"
    })
  }
  else {
    let dishID = await backend.createDish(req.body.res_id, req.body.name, req.body.price)
    let restaurants = await backend.getRestaurants();

    restaurants[req.body.res_id].menu.forEach(dish => {
      if (dish.dish_id == dishID) response = dish
    })
    res.json(response);
  }
})