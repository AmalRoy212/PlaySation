const mongoose = require('mongoose');
mongoose.set('strictQuery', false);

const mongooConnector = async function(){
    
    await mongoose.connect("mongodb+srv://AmalKen:commandOpen6238@cluster0.fl3ecwq.mongodb.net/?retryWrites=true&w=majority");

}

module.exports = mongooConnector