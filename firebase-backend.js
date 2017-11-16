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
function createRestaurant(name, lat, lng) {
   let restoID = `resto_${genUID()}`
   let restaurant = {
        restoID,
        name,
        lat,
        lng
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

async function getMenu(restoID) {
    const menu = await restaurants.child(restoID).child('menu').once('value')
    return menu.val()
}


// Returns a list of burger objects



async function getAllMenus() {
    let menus = []
    for (const restoID in await getRestaurants()) {
        const menu = await getMenu(restoID)
        // console.log(menu)
        if (menu) menus = menus.concat(menu)
        // console.log("allBurgers ", allBurgers);
    }
    return menus;
}

async function getAllBurger() {
    let burgers = []
    for (const menu in await getAllMenus()) {
        const burger = await getAllMenus(menu)
        // console.log(burger)
        if (burger) burgers = burgers.concat(burger)
    }
    return burgers;
}

// Returns a list of burgers objects sorted by price
async function sortBurgersByPrice() {
    const allB = await getAllBurger()
    return allB.sort(function(burger1, burger2) {
        return burger1.price - burger2.price
    }
    )

}



module.exports = {
    createRestaurant,
    createMenuItem,
    getAllMenus,
    sortBurgersByPrice
}


async function runTests() {
    await database.ref("/").set(null)

    let resto1 = await createRestaurant('A&W', 45.5047528, -73.5725866)
    let resto2 = await createRestaurant("McDonald's", 45.5033042, -73.5694826)
    let resto3 = await createRestaurant("Burger King", 45.504193, -73.5683899)
    let restaurants = await getRestaurants()

    assert(Object.keys(restaurants).length === 3)

    await createMenuItem(resto1, "Momma Burger", 4.49)
    await createMenuItem(resto1, "Teen Burger", 1.99)
    await createMenuItem(resto2, "Big Mac", 3.99)
    restaurants = await getRestaurants()
    
    const menu = await getMenu(resto1)
    
    assert(Object.keys(menu).length === 2)
    

    assert(Object.keys(await getMenu(resto2)).length === 1)
    
    const allMenus = await getAllMenus()

    assert(allMenus.length === 2)
    
    // let burgersSortedByPrice = await sortBurgersByPrice(allBurgers)
    // assert(burgersSortedByPrice[0].price === 1.99)
    // assert(burgersSortedByPrice[2].price === 4.49)

    // console.log("ok")
    const burgerr = await sortBurgersByPrice()
    console.log("burgerr ", burgerr)

    

    console.log("All test passed")
}
runTests()