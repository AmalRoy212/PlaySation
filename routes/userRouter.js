const express = require('express');
const userRouter = express();
const userController = require('../controllers/userController');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const logger = require('morgan');
const session = require('express-session');
const config = require('../config/config');
const auth = require('../middleware/auth');
const passport = require('passport');
require('../helpers/passport-setup');
// const cache = require('')

//session
userRouter.use(session({
    secret:config.sessionSecrect,
    isDeleting:false,
    resave: true,
    saveUninitialized: true
}));

//setting up passport
userRouter.use(passport.initialize());
userRouter.use(passport.session());

//settnig logger
userRouter.use(logger('dev'));
//setting the view engine for the user
userRouter.set('views', './views/users');
//url encoding
userRouter.use(bodyParser.json());
userRouter.use(bodyParser.urlencoded({extended:true}));
//setting multer for store images
const storage = multer.diskStorage({
    destination:function(req,file,callback){
        callback(null, path.join(__dirname));
    },
    filename:function(req,file,callback){
        const name = Date.now()+'-'+file.originalname;
        callback(null,name);
    }
})
const upload = multer({storage:storage});

userRouter.get('/signup',auth.isLogout,userController.loadSignup);
userRouter.post('/signup',upload.single('image'),userController.creatingUser);
userRouter.get('/verify',userController.verifyMail);
userRouter.get('/login',auth.isLogout,userController.loadLogin);
userRouter.post('/loginVerification',userController.verifyingUser);
userRouter.get('/',userController.loadHome);
userRouter.post ('/logout',auth.isLogin,userController.usreLogginOut);
userRouter.get('/forgetverify',auth.isLogout,userController.loadForgerVerification);
userRouter.post('/forgetverify',userController.verifyingResetPassword);
userRouter.get('/resetpassword',auth.isLogout,userController.loadResetPassword);
userRouter.post('/resetpassword',userController.resettingPassword);
userRouter.get('/otpverify',userController.loadOtp);
userRouter.post('/otpverify',userController.userOtpVeriying);
userRouter.get('/userprofile',auth.isLogin,userController.loadUserProfile);
userRouter.post('/userprofile',userController.loadEditProfile);
// userRouter.get('/edituser',auth.isLogin,userController.laodProfileEdit);
userRouter.post('/edituser',userController.updateUserDetails);
userRouter.get('/products',auth.isLogin,userController.loadProducts);
userRouter.get('/product-view',auth.isLogin,userController.loadingCheckout);
// userRouter.post('/product-view',auth.isLogin,userController.proceedToPay)
userRouter.get('/check-out',auth.isLogin,userController.loadPayment);
userRouter.post('/check-out',auth.isLogin,userController.createNeworder);
userRouter.get('/payment',auth.isLogin,userController.loadPaymentSuccess)
userRouter.get('/load-game',auth.isLogin,userController.loadGame);
userRouter.get('/cart',auth.isLogin,userController.loadCart);
userRouter.post('/cart',auth.isLogin,userController.creatingCartItem);
userRouter.post('/editPassword',userController.editPassword);
userRouter.post('/cart-delete',auth.isLogin,userController.deleteCartItem);
userRouter.get('/google',passport.authenticate('google',{scope:['profile','email']}));
userRouter.get('/google/auth',passport.authenticate('google',{failureRedirect:'/failed'}), userController.googleAuth);
userRouter.get('/reload/otp',userController.resendOtp);
userRouter.post('/coupon',auth.isLogin,userController.checkingTheCouponValidity);
userRouter.post('/game/search',userController.findGames)
// userRouter.get('*',function(req,res){
//     try {
//         res.render('error');
//     } catch (error) {
//         console.log(error.message)
//     }
// })






module.exports = userRouter;

