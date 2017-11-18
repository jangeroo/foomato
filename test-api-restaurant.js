var expect = require('chai').expect;
const request = require('superagent')

const FOOMATO_URL = 'http://localhost:5000'
const api_restaurant = FOOMATO_URL + '/restaurant'


function GET_restaurant(res_id) {
  return res_id ?
    request.get(api_restaurant).query(`res_id=${res_id}`) :
    request.get(api_restaurant)

}

function POST_restaurant(restaurant) {
  return request.post(api_restaurant).type('form').send(restaurant)
}


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
    var newResto = {
      name: 'BashuTime',
      latitude: Math.random() * 100,
      longitude: Math.random() * 100
    }
    await POST_restaurant(newResto)
    // call a second time to ensure at least 2 restaurants
    await POST_restaurant(newResto)
    var allRestaurants = (await GET_restaurant()).body
    // check that there are multiple objects in the list
    expect(allRestaurants.length).to.be.greaterThan(1)
    // check that the objects have the right properties defined
    expect(allRestaurants[0].id).to.not.be.undefined
    expect(allRestaurants[0].name).to.not.be.undefined
    expect(allRestaurants[0].location.latitude).to.not.be.undefined
    expect(allRestaurants[0].location.longitude).to.not.be.undefined
  })

  it('returns a restaurant object if a valid res_id is provided', async () => {
    var newResto = {
      name: 'BashuTime',
      latitude: Math.random() * 100,
      longitude: Math.random() * 100
    }
    let postResponse = await POST_restaurant(newResto)
    let responseResto = (await GET_restaurant(postResponse.body.id)).body
    // NOTE: this currently returns a list with a single object. It should return the object itself
    expect(responseResto.name).to.equal(newResto.name)
    expect(parseFloat(responseResto.location.latitude)).to.deep.equal(newResto.latitude)
    expect(parseFloat(responseResto.location.longitude)).to.deep.equal(newResto.longitude)
  })

  it('returns an error if res_id is invalid', async () => {
    let res_id = 'booya'
    let response = (await GET_restaurant(res_id)).body
    expect(response.code).to.equal(404)
    expect(response.status).to.equal('Not Found')
    expect(response.message).to.equal(`No restaurant matching res_id: ${res_id}`)
  })
})


describe('POST /restaurant', function () {

  it('returns the newly created restaurant object', async () => {
    var newResto = {
      name: 'Michael Burger',
      latitude: 45,
      longitude: 73,
    }
    var response = (await POST_restaurant(newResto)).body
    expect(response.name).to.equal('Michael Burger')
    expect(response.location.latitude).to.equal('45')
    expect(response.location.longitude).to.equal('73')
    expect(response.id).to.not.be.undefined
    var resto = (await GET_restaurant(response.id)).body
    expect(resto.name).to.equal('Michael Burger')
  })

  it('adds a new restaurant to the list of restaurants', async () => {
    var numRestaurants = (await GET_restaurant()).body.length

    var restaurant = { name: 'AlbertoTime', latitude: 46, longitude: 75 }
    await POST_restaurant(restaurant)

    var response = await GET_restaurant()
    expect(response.body.length).to.equal(numRestaurants + 1)
  })

  it('requires parameters: name, latitude, longitude', async () => {
    let badRequestError = {
      code: 400,
      status: 'Bad Request',
      message: 'Missing name, latitude or longitude'
    }

    // test missing name
    var newResto = { latitude: 45, longitude: 73 }
    var response = await POST_restaurant(newResto)
    expect(response.body).to.deep.equal(badRequestError)

    // test missing latitude
    var newResto = { name: 'Michael Burger', longitude: 73 }
    var response = await POST_restaurant(newResto)
    expect(response.body).to.deep.equal(badRequestError)

    // test missing longitude
    var newResto = { name: 'Michael Burger', latitude: 45 }
    var response = await POST_restaurant(newResto)
    expect(response.body).to.deep.equal(badRequestError)
  });
});


