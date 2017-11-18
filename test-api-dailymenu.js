var expect = require('chai').expect;
const request = require('superagent')

const FOOMATO_URL = 'http://localhost:5000'
const api_restaurant = FOOMATO_URL + '/restaurant'
const api_dailymenu = FOOMATO_URL + '/dailymenu'


function GET_dailymenu(res_id) {
  return res_id ?
    request.get(api_dailymenu).query(`res_id=${res_id}`) :
    request.get(api_dailymenu)
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


describe('GET /dailymenu', async () => {
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

  // it('requires parameter: res_id', async () => {

  it('requires parameters: res_id, name, price', async () => {
    let badRequestError = {
      "code": 400,
      "status": "Bad Request",
      "message": "No Restaurant ID provided"
    }
    var responsMissing_res_id = await GET_dailymenu()
    expect(responsMissing_res_id.body).to.deep.equal(badRequestError)
  })
  it('returns an error if res_id is invalid', async () => {
    let res_id = 'booya'
    let response = (await GET_dailymenu(res_id)).body
    expect(response.code).to.equal(404)
    expect(response.status).to.equal('Not Found')
    expect(response.message).to.equal(`No restaurant matching res_id: ${res_id}`)
  })
  it('returns a Zomato-modeled daily menu object', async () => {
    // create a restaurant
    var res_id = (await POST_restaurant({ name: 'Albertos Place', latitude: 45.5, longitude: 73.3 })).body.id
    var menu = (await GET_dailymenu(res_id)).body
    expect(menu).to.have.property('daily_menu')
    expect(menu.daily_menu).to.have.property('length')
    expect(menu.daily_menu[0]).to.have.property('dishes')
    expect(menu.daily_menu[0].dishes).to.have.property('length')
  })
  it('returns includes all menu items for the restaurant', async () => {
    // create a restaurant
    var res_id = (await POST_restaurant({ name: 'Albertos Place', latitude: 45.5, longitude: 73.3 })).body.id
    // add some menu items
    await POST_dailymenu({ res_id, name: 'Uno Burger', price: 1.99 })
    await POST_dailymenu({ res_id, name: 'Dos Burger', price: 2.99 })
    // get menu for restaurant
    var dishes = (await GET_dailymenu(res_id)).body.daily_menu[0].dishes
    expect(dishes.length).to.equal(2)
    // expect(menu.daily_menu[0].dishes.length).to.equal(2)
  })
})

describe('POST /dailymenu', async () => {

  it('requires parameters: res_id, name, price', async () => {
    var res_id = await GET_restaurant()
    let badRequestError = {
      code: 400,
      status: 'Bad Request',
      message: 'Missing res_id, name or price'
    }

    var bodyMissing_res_id = { name: 'Momma Burger', price: 2.99 }
    var responsMissing_res_id = await POST_dailymenu(bodyMissing_res_id)

    var bodyMissing_name = { res_id: 'booya', price: 2.99 }
    var responseMissing_name = await POST_dailymenu(bodyMissing_name)

    var bodyMissing_price = { res_id: 'booya', name: 'Momma Burger' }
    var responseMissing_price = await POST_dailymenu(bodyMissing_price)

    expect(responsMissing_res_id.body).to.deep.equal(badRequestError)
    expect(responseMissing_name.body).to.deep.equal(badRequestError)
    expect(responseMissing_price.body).to.deep.equal(badRequestError)
  })

  it('requires a valid res_id', async () => {
    var body = { res_id: 'booya', name: 'Momma Burger', price: 3.99 }
    var response = await POST_dailymenu(body)
    expect(response.body.code).to.equal(404)
    expect(response.body.status).to.equal('Not Found')
    expect(response.body.message).to.equal(`No restaurant matching res_id: ${body.res_id}`)
  })

  it('adds a new dish to the menu for the specified restaurant', async () => {
    var resto = (await POST_restaurant({ name: 'GraceFace', latitude: 45, longitude: 73 })).body

    var dish1_payload = { res_id: resto.id, name: 'Thanksgiving Burger', price: 8.99 }
    var dish2_payload = { res_id: resto.id, name: 'Christmas Burger', price: 9.99 }
    var dish1 = await POST_dailymenu(dish1_payload)
    var dish2 = (await POST_dailymenu(dish2_payload)).body

    var response = await GET_dailymenu(resto.id)
    var menu = response.body.daily_menu[0].dishes
    expect(menu.length).to.equal(2)
  })
})
