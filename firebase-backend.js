const assert = require('assert');

var admin = require("firebase-admin");
var serviceAccount = require("./foomenu-zomato-firebase-adminsdk-ph434-d792ea1f44.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://foomenu-zomato.firebaseio.com"
});
var database = admin.database()


let restaurants = {}

function genUID() {
    return Math.floor(Math.random() * 100000000)
}

// Adds a restaurant and returns the restaurant ID
function createRestaurant(name, lat, lng) {
}

// Adds a burger to the restaurant's menu
function createMenuItem(restoID, burgerName, price) {
}

// Returns a list of burger objects
function getAllBurgers() {
}

// Returns a list of burgers objects sorted by price
function sortBurgersByPrice(burgers) {
}



module.exports = {
    createRestaurant,
    createMenuItem,
    getAllBurgers,
    sortBurgersByPrice
}


async function runTests() {
    let resto1 = await createRestaurant('A&W', 45.5047528, -73.5725866)
    let resto2 = await createRestaurant("McDonald's", 45.5033042, -73.5694826)
    let resto3 = await createRestaurant("Burger King", 45.504193, -73.5683899)
    assert(Object.keys(restaurants).length === 3)

    await createMenuItem(resto1, "Momma Burger", 4.49)
    await createMenuItem(resto1, "Teen Burger", 1.99)
    await createMenuItem(resto2, "Big Mac", 3.99)
    assert(restaurants[resto1].menu.length === 2)
    assert(restaurants[resto2].menu.length === 1)

    let allBurgers = await getAllBurgers()
    assert(allBurgers.length === 3)
    let burgersSortedByPrice = await sortBurgersByPrice(allBurgers)
    assert(burgersSortedByPrice[0].price === 1.99)
    assert(burgersSortedByPrice[2].price === 4.49)


    console.log("All test passed")
}
runTests()