const request = require('superagent')

const FOOMATO_URL = 'https://foomato.herokuapp.com'
const api_restaurant = FOOMATO_URL + '/restaurant'
const api_dailymenu = FOOMATO_URL + '/dailymenu'


function genLocation() {
  const MIN_LNG = -73.75
  const MAX_LNG = -73.53
  const MIN_LAT = 45.415
  const MAX_LAT = 45.555
  return {
    lat: MIN_LAT + (Math.random() * (MIN_LAT - MAX_LAT) + (MAX_LAT - MIN_LAT)),
    lng: MIN_LNG + (Math.random() * (MIN_LNG - MAX_LNG) + (MAX_LNG - MIN_LNG))
  }
}


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


let restaurants = []

mapRestaurants = async (restaurant) => {
  let res_id = (await POST_restaurant(restaurant)).body.id
  return res_id
}
let res_ids = restaurants.map(mapRestaurants)