// source: https://gist.github.com/raineorshine/f925f0a65658ee832a00bdc8d67301d1
// Streams all values from a public contract array. Callback is a function that takes a single 
// argument, one item from the array. Returns a promise that rejects if there is any error or 
// resolves if all items have been retrieved.
function getAll(contract, sizeGetter, array, cb) {
    // get the size of the array
    return contract[sizeGetter]().then(n => {
        // generate an array of contract calls
        return Promise.all(Array(n.toNumber()).fill().map(i => {
            // invoke the callback with the item
            return contract[array](i).then(cb)
        }))
    })
}

// gets all orders from myContract
getAll(myContract, 'numOrders', 'orders', order => {
    console.log('Got an order!', order)
})
.then(orders => {
    console.log('Done!', order
