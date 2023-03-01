// const mongoose = require('mongoose');
const mongoose = require('./helpers/mongoose');
const express = require("express");
const app = express();
const userRouter = require('./routes/userRouter');
const adminRoter = require('./routes/adminRouter');
const path = require('path');
const expHbs = require('express-handlebars');
const nocache = require('nocache');
const cors = require('cors');
require('dotenv').config();


//setting corse
app.use(cors());
//creating a hbs helper for incrementing operation
const hbs = expHbs.create({
    helpers: {
      inc: function(value, options) {
        return parseInt(value) + 1;
      }
    }
});
app.engine('handlebars', hbs.engine);

//settingthe cache controlls
app.use(nocache());
//connrctiong mongoose
mongoose();
//setting the view engine
app.set("views",path.join(__dirname,'views'))
app.set('view engine','hbs');
// mongoose.connect("mongodb://127.0.0.1:27017/playStation");
app.use(express.static(__dirname + "/public"));
//setting user router
app.use('/',userRouter);
//setting admin
app.use('/admin',adminRoter);
app.get('*',function(req,res){
    try {
        res.render('error');
    } catch (error) {
        console.log(error.message)
    }
})


app.listen(3000);
