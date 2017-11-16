const assert = require('assert');

let restaurants = {}

function genUID() {
    return Math.floor(Math.random() * 100000000)
}

// Adds a restaurant and returns the restaurant ID
function createRestaurant(name, lat, lng) {
    restoID = 'resto_' + genUID()
    restaurants[restoID] = {
        name,
        coordinates: {
            lat,
            lng
        },
        menu: []
    }
    return restoID
}
function getRestaurants() {
    return restaurants
}

// Adds a burger to the restaurant's menu
function createMenuItem(restoID, burgerName, price) {
    restaurants[restoID].menu.push({ burgerName, price })
}

// Returns a list of burger objects
function getAllBurgers() {
    let allBurgers = []
    for (var restoID in restaurants) {
        // console.log(`restaurants[${restoID}].menu `, restaurants[restoID].menu);
        allBurgers = allBurgers.concat(restaurants[restoID].menu);
        // console.log("allBurgers ", allBurgers);
    }
    return allBurgers;
}

// Returns a list of burgers objects sorted by price
function sortBurgersByPrice(burgers) {
    return burgers.sort(function(a, b) {
        return a.price - b.price;
    })
}



module.exports = {
    genUID,
    createRestaurant,
    getRestaurants,
    createMenuItem,
    getAllBurgers,
    sortBurgersByPrice
}


function runTests() {
    let resto1 = createRestaurant('A&W', 45.5047528, -73.5725866)
    let resto2 = createRestaurant("McDonald's", 45.5033042, -73.5694826)
    let resto3 = createRestaurant("Burger King", 45.504193, -73.5683899)
    assert(Object.keys(restaurants).length === 3)

    createMenuItem(resto1, "Momma Burger", 4.49)
    createMenuItem(resto1, "Teen Burger", 1.99)
    createMenuItem(resto2, "Big Mac", 3.99)
    assert(restaurants[resto1].menu.length === 2)
    assert(restaurants[resto2].menu.length === 1)

    let allBurgers = getAllBurgers()
    assert(allBurgers.length === 3)
    let burgersSortedByPrice = sortBurgersByPrice(allBurgers)
    assert(burgersSortedByPrice[0].price === 1.99)
    assert(burgersSortedByPrice[2].price === 4.49)



    console.log("All test passed")
}
runTests()