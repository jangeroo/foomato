const request = require('superagent')

const FOOMATO_URL = 'https://foomato.herokuapp.com'
const api_restaurant = FOOMATO_URL + '/restaurant'
const api_dailymenu = FOOMATO_URL + '/dailymenu'

function POST_dailymenu(dish) {
  return request.post(api_dailymenu).type('form').send(dish)
}

function GET_restaurant(res_id) {
  return res_id ?
    request.get(api_restaurant).query(`res_id=${res_id}`) :
    request.get(api_restaurant)
}

function POST_restaurant(restaurant) {
  return request.post(api_restaurant).type('form').send(restaurant)
}


function genLocation() {
  const MIN_LAT = 45.415
  const MAX_LAT = 45.555
  const MIN_LNG = -73.75
  const MAX_LNG = -73.53

  lat = MIN_LAT + (Math.random() * (MIN_LAT - MAX_LAT) + (MAX_LAT - MIN_LAT))
  lng = MIN_LNG + (Math.random() * (MIN_LNG - MAX_LNG) + (MAX_LNG - MIN_LNG))

  // Limit precision to 6 decimal places to avoid coordinates
  // that are too precise to be found
  return {
    lat: parseFloat(lat.toFixed(6)),
    lng: parseFloat(lng.toFixed(6))
  }
}

function genRestaurantDetails() {
  let location = genLocation()
  return {
    name: `Burger Joint ${Math.random()}`,
    latitude: location.lat,
    longitude: location.lng
  }

}

async function generateRestaurants(numRestaurants) {
  let restaurants = Array.from(Array(numRestaurants).keys()).map(genRestaurantDetails)
  mapRestaurants = async (restaurant) => {
    let res_id = (await POST_restaurant(restaurant)).body.id
    return res_id
  }
  let promises = restaurants.map(mapRestaurants)
  return Promise.all(promises)
}

async function generateBurgers(res_ids) {
  async function generateMenu(res_id) {
    let numBurgers = Math.floor(Math.random() * 3) + 1
    for (let i = 0; i < numBurgers; i++) {
      await POST_dailymenu({
        res_id,
        name: `Burger ${Math.random()}`,
        price: Math.floor(Math.random() * 1000) / 100
      })
    }
  }
  res_ids.forEach(generateMenu)
}

async function createTestData(numRestaurants) {
  let res_ids = await generateRestaurants(numRestaurants)
  await generateBurgers(res_ids)
}

createTestData(5)