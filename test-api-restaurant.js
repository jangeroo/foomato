var expect = require('chai').expect;
// var rp = require('request-promise')
const request = require('superagent')

const FOOMATO_URL = 'http://localhost:5000'
const restaurantEndpoint = FOOMATO_URL + '/restaurant'

describe('POST /restaurant', function () {

  it('returns the newly created restaurant object', async () => {
    var body = {
      name: 'Michael Burger',
      latitude: 45,
      longitude: 73,
    }
    var response = await request.post(restaurantEndpoint).type('form').send(body)
    expect(response.body.name).to.equal('Michael Burger')
    expect(response.body.location.latitude).to.equal('45')
    expect(response.body.location.longitude).to.equal('73')
    var getURL = FOOMATO_URL + `${response.header.location}`
    var resto = (await request.get(getURL)).body
    expect(resto.name).to.equal('Michael Burger')
  })

  it('adds a new restaurant to the list of restaurants', async () => {
    var numRestaurants = (await request.get(restaurantEndpoint)).body.length

    var restaurant = { name: 'AlbertoTime', latitude: 46, longitude: 75 }
    await request.post(restaurantEndpoint).type('form').send(restaurant)

    var response = await request.get(restaurantEndpoint)
    expect(response.body.length).to.equal(numRestaurants + 1)
  })

  it('requires parameters: name, latitude, longitude', async () => {
    let badRequestError = {
      code: 400,
      status: 'Bad Request',
      message: 'Missing name, latitude or longitude'
    }

    // test missing name
    var body = {
      latitude: 45,
      longitude: 73
    }
    var response = await request.post(restaurantEndpoint).type('form').send(body)
    expect(response.body).to.deep.equal(badRequestError)

    // test missing latitude
    var body = {
      name: 'Michael Burger',
      longitude: 73
    }
    var response = await request.post(restaurantEndpoint).type('form').send(body)
    expect(response.body).to.deep.equal(badRequestError)

    // test missing longitude
    var body = {
      name: 'Michael Burger',
      latitude: 45
    }
    var response = await request.post(restaurantEndpoint).type('form').send(body)
    expect(response.body).to.deep.equal(badRequestError)
  });
});


describe('GET /restaurant', () => {

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

  it('returns a list of all restaurants if no res_id provided', async () => {
    var body = { name: 'BashuTime', latitude: 23, longitude: 34 }
    await request.post(restaurantEndpoint).type('form').send(body)
    // call a second time to ensure at least 2 restaurants
    await request.post(restaurantEndpoint).type('form').send(body)
    var restaurants = (await request.get(restaurantEndpoint)).body
    expect(restaurants.length).to.be.greaterThan(1)
    expect(restaurants[0]).to.have.property('id')
    expect(restaurants[0]).to.have.property('name')
    expect(restaurants[0].location).to.have.property('latitude')
    expect(restaurants[0].location).to.have.property('longitude')
  })

  it('returns a restaurant object if a valid res_id is provided', async () => {
    var body = {
      name: 'BashuTime',
      latitude: Math.random() * 100,
      longitude: Math.random() * 100
    }
    let postResponse = await request.post(restaurantEndpoint).type('form').send(body)
    let response = await request.get(FOOMATO_URL + postResponse.header.location)
    // NOTE: this currently returns a list with a single object. It should return the object itself
    expect(response.body.name).to.equal(body.name)
    expect(parseFloat(response.body.location.latitude)).to.deep.equal(body.latitude)
    expect(parseFloat(response.body.location.longitude)).to.deep.equal(body.longitude)
  })

  it('returns an error if res_id is invalid', async () => {
    let res_id = 'booya'
    let response = await request.get(restaurantEndpoint).query(`res_id=${res_id}`)
    expect(response.body.code).to.equal(404)
    expect(response.body.status).to.equal('Not Found')
    expect(response.body.message).to.equal(`No restaurant matching res_id: ${res_id}`)
  })
})