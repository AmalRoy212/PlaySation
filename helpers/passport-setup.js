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
    clientID:'639704585586-52ce4ecmtabsnp5uok4h4me06p3unp6g.apps.googleusercontent.com',
    clientSecret:'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',
    callbackURL:'https://myplaystation.onrender.com/google/auth',
    passReqToCallback:true

}, function(request, accessToken, refreshToken, profile, done){
    console.log(profile);
    return done(null,profile); 
}));
