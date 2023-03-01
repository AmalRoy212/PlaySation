const mongoose = require('mongoose');
mongoose.set('strictQuery', false);

const mongooConnector = async function(){
    await mongoose.connect("mongodb://127.0.0.1:27017/playStation");

}

module.exports = mongooConnector