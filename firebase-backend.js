const assert = require('assert');

var admin = require("firebase-admin");
var serviceAccount = require("./foomenu-zomato-firebase-adminsdk-ph434-d792ea1f44.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://foomenu-zomato.firebaseio.com"
});
var database = admin.database()

let restaurants = database.ref('/restaurants')

function genUID() {
    return Math.floor(Math.random() * 100000000)
}

// Adds a restaurant and returns the restaurant ID
function createRestaurant(name, latitude, longitude) {
   let restoID = `resto_${genUID()}`
   let restaurant = {
        restoID,
        name,
       location: {
           latitude,
           longitude
       },
   }

   return restaurants.child(restoID).set(restaurant)
    .then(() => restoID)
}

function getRestaurants() {
    return restaurants.once('value')
    .then(resto => resto.val())
}

// Adds a burger to the restaurant's menu
function createMenuItem(restoID, burgerName, price) {
    let menuItemID = `menuItem_${genUID()}`
    let menuItem = {
        burgerName,
        price
    }

    return restaurants.child(restoID).child('menu').child(menuItemID).set(menuItem)
    .then(() => menuItem)

}

// Returns a menu object
async function getMenu(restoID) {
    const menu = await restaurants.child(restoID).child('menu').once('value')
    return menu.val()
}

// Returns a list of menu objects
async function getAllMenus() {
    let menus = []
    for (const restoID in await getRestaurants()) {
        const menu = await getMenu(restoID)
        if (menu) menus = menus.concat(menu)
    }
    return menus;
}

// Returns a list of burger objects
async function getAllBurgers() {
    let burgers = []

    const menus = await getAllMenus()

    menus.forEach(menu => {
        const menuItems = Object.values(menu)
        burgers = burgers.concat(menuItems)
    })

    return burgers
}

// Returns a list of burgers objects sorted by price
async function sortBurgersByPrice(allBurgers) {
    const sortedBurgers = allBurgers.sort((b1, b2) => b1.price - b2.price)
    return sortedBurgers
}

module.exports = {
    module_name: 'FIREBASE backend',
    genUID,
    createRestaurant,
    getRestaurants,
    createMenuItem,
    getMenu,
    getAllMenus,
    getAllBurgers,
    sortBurgersByPrice,
}


async function runTests() {
    await database.ref("/").set(null)

    // test createRestaurant() and getRestaurants()
    let resto1 = await createRestaurant('A&W', 45.5047528, -73.5725866)
    let resto2 = await createRestaurant("McDonald's", 45.5033042, -73.5694826)
    let resto3 = await createRestaurant("Burger King", 45.504193, -73.5683899)
    let restaurants = await getRestaurants()
    assert(Object.keys(restaurants).length === 3)

    // test createMenuItem(), getMenu(), getAllMenus()
    await createMenuItem(resto1, "Momma Burger", 4.49)
    await createMenuItem(resto1, "Teen Burger", 1.99)
    await createMenuItem(resto2, "Big Mac", 3.99)
    restaurants = await getRestaurants()

    // test getMunu() and getAllMenus()
    const menu1 = await getMenu(resto1)
    const menu2 = await getMenu(resto2)
    assert(Object.keys(menu1).length === 2)
    assert(Object.keys(menu2).length === 1)
    const allMenus = await getAllMenus()
    assert(allMenus.length === 2)

    //test getAllBurgers()
    const allBurgers = await getAllBurgers()
    assert(Object.keys(allBurgers).length === 3)

    // test sortBurgersByPrice()
    const burgersSortedByPrice = await sortBurgersByPrice(allBurgers)
    assert(burgersSortedByPrice[0].price === 1.99)
    assert(burgersSortedByPrice[2].price === 4.49)


    console.log("All test passed")
}
runTests()