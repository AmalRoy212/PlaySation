const mongoose = require('mongoose');

const order = mongoose.Schema({
    orderId: {
        type: String,
        require: true
    },
    orderDate: {
        type: Date,
        default: new Date()
    },
    userId: {
        type: String,
        require: true
    },
    gameId: {
        type: String,
        require: true
    },
    userName: {
        type: String,
        require: true
    },
    gameName: {
        type: String,
        require: true
    },
    userMail: {
        type: String,
        require: true
    },
    actualPrice: {
        type: Number,
        require: true
    },
    country: {
        type: String,
        require: true
    },
    zipCode: {
        type: Number,
        require: true
    },
    state: {
        type: String,
        require: true
    },
    disCode: {
        type: String,
        require: true
    },
    subTotal: {
        type: String,
        require: true
    },
    discount: {
        type: String,
        require: true
    },
    spacialToken: {
        type: Number,
        require: true
    },
    total: {
        type: Number,
        require: true
    }
})

const Orders = mongoose.model('Order', order);
module.exports = Orders;