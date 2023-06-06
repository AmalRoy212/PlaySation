const passport = require('passport');
const { request } = require('../routes/userRouter');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

//managing the serialize and deserializing of userc
passport.serializeUser(function(user,done){
    done(null,user);
})
passport.deserializeUser(function(user,done){
    done(null,user);
})

//setting the passport calls
passport.use(new GoogleStrategy({
    clientID:"16435703901-mbd7tdfsfujt096627sbpb7njpdjsfrl.apps.googleusercontent.com",
    clientSecret:"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",
    callbackURL:"https://myplaystation.onrender.com/google/auth",
    passReqToCallback:true

}, function(request, accessToken, refreshToken, profile, done){
    console.log(profile);
    return done(null,profile); 
}));
