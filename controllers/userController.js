const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const config = require('../config/config');
const GamesModels = require('../models/products');
const orderModel = require('../models/orderModel');
const Category = require('../models/category');
const userModel = require('../models/userModel');
const randomString = require('randomstring');
const Razorpay = require('razorpay');
const passport = require('passport');
const bannerModel = require('../models/bannerModel');

let userMessage
let usrId
let userObject 
let otpChecking
let user_Spied = false;
let userHomeId
let isLoggedIn=false;
let newPassOne;
let editSpied = false;
let sccMsg;
let cartCount = 0;
let update =false;
let userResendMail;
let gameCollection;
let search;

//securing the password
async function securingPassword(password){
    try {
        const hashPassword = await bcrypt.hash(password,10);
        return hashPassword;
    } catch (error) {
        console.log(error.message);
    }
}

//finding the array of the user cartItmes 
async function findTheCartItmes(id){
    try {
        const userData = await userModel.findById({_id:id});
        const newCart = userData.cartItems;
        let gameCartIdies = []
        for(var i=0;i<newCart.length;i++){
            gameCartIdies[i] = newCart[i].gameId;
        }
        return gameCartIdies;
    } catch (error) {
        console.log(error.message);
    }
}

//custome random strig with numbers
async function randomGenertor(){
    try {
        const rndmWord = await randomString.generate(3)
        let rndmNumber = await createOtp();
        rndmNumber=rndmNumber/1000;
        rndmNumber = Math.floor(rndmNumber)
        const randomKey = "#"+rndmWord+rndmNumber;
        return randomKey;
    } catch (error) {
        console.log(error.message);
    }
}

//finding the category array
async function findTheCategories(){
    //category want validate
    try {
        const categoryCollection = await Category.find();
        let i =0;
        let catNames = [];
        for(i=0;i<categoryCollection.length;i++){
            catNames[i]=categoryCollection[i].gameCategory
        }
        return catNames;
    } catch (error) {
        console.log(error.message);
    }
}

//after verifyig the mail in data base creating a user account
async function insertingAccount(userdataObj){
    try {
        const encPassword = await securingPassword(userdataObj.password);
        const fname = userdataObj.fname;
        const email = userdataObj.email;
        const user = new User({
            fname:fname,
            lname:userObject.lname,
            email:email,
            mobile:userObject.mobile,
            // image:imgFilename,
            password:encPassword,
            is_admin:0
        })
        const userData = await user.save();
        return userData;
    } catch (error) {
        console.log(error.message);
    }
}

//sending verification mail
async function sendingVerificationMail(userName,email,userID){
    try {
        const newOtp= await createOtp();
        otpChecking = newOtp;
        // console.log(newOtp,'__________________________________90')
        const transport = nodemailer.createTransport({
            host:'smtp.gmail.com',
            port:587,
            secure:false,
            requireTLS:true,
            auth:{
                user:config.AdEmail,
                pass:config.AdPassword
            }
        });
        const mailOption = {
            from:config.AdEmail,
            to:email,
            subject:'For Mail Verification',
            html:"<p>Hii <b>"+userName+'</b>, Please click  here to <a href="http://localhost:3000/verify?id='+userID+'">verify</a> you mail Your One time Password <h5>'+newOtp+'</h5>'
        }
        transport.sendMail(mailOption,function(err,info){
            if(err){
                console.log(err)
            }else{
                console.log('mail has been send :-',info.response);
            }
        })
    } catch (error) {
        console.log(error.message)
    }
}

//creating a manual otp
async function createOtp(){
    try {
        let otp = Math.random();
        otp = otp* 10000000;
        otp = Math.trunc(otp);
        otp = otp+ '';
        otp = otp.slice(0,6);
        otp = otp*1;
        return otp;
    } catch (error) {
        console.log(error.message);
    }
}

//chcking user otp and the random otp
async function validatingOtp(currentOtp,userOtp){
    if(currentOtp == userOtp){
        return true
    }else{
        return false
    }
}

//creating a new order
async function creatingOrder(userId,game,orderObject,razorOrder){
    try {
        // const rndmKey = await randomGenertor();
        console.log('____________hitted on order creation___________167',razorOrder);
        let today = new Date();
        today = today.toLocaleDateString();
        // console.log(rndmKey,"__________________________________147")
        const userD = await userModel.findById({_id:userId});
        const gameD = await GamesModels.findById({_id:game})
        console.log('____________hitted on order creation___________173F',orderObject);
        const newOrder = new orderModel({
            orderId:razorOrder.id,
            userId:userId,
            orderDate:today,
            gameId:game,
            userName:razorOrder.receipt,
            userMail:userD.email,
            gameName:gameD.name,
            actualPrice:gameD.price,
            country:orderObject.country,
            zipCode:orderObject.zip,
            state:orderObject.state,
            disCode:orderObject.discode,
            subTotal:orderObject.subtotal,
            discount:orderObject.discount,
            spacialToken:orderObject.spacialtoken,
            total:orderObject.amount
        })
        const orderCompleted = await newOrder.save();
        console.log('done_____________________________________________175',orderCompleted);
        return orderCompleted;
    } catch (error) {
        console.log(error.message);
    }
}

//cart optimizing when the user click the same game twilce want to inform the user its already exist
async function cartOptimizing(reqGame,cartObj){
    try {
        //taking the game name from the user
        let cartGames = []
        for(i=0;i<25;i++){
            cartGames[i] = cartObj[i].gameName;
        }
        const isInclude = cartGames.includes(reqGame);
        return isInclude;
    } catch (error) {
        console.log(error);
    }
}

//get and post starts verifying mail
const verifyMail = async function(req,res){
    try {
        const updateInfo = await User.updateOne({_id:req.query.id},{$set:{is_verified : 1}})
        const findUser = await User.findById({ _id:req.query.id})
        if(updateInfo){
            if(findUser){
                res.render('emailverified',{userName:findUser.fname,email:findUser.email,user_Spied});
            }
        }
    } catch (error) {
        console.log(error.message);
    }
}

//rendering the sign up page to user for the first request
const loadSignup = async function(req,res){
    try {
        res.render('signup',{userMessage});
        userMessage=''
    } catch (error) {
        console.log(error.message);
    }
}

//creating a user when the for is getting submitted
const creatingUser = async function(req,res){
    try {
        userObject = req.body;
        const fullName = userObject.fname+" "+userObject.lname;
        // imgFilename = req.file.filename;
        if(userObject){
            const newOtp = await createOtp();
            if(newOtp){
                res.redirect('/otpverify');
                user_Spied=true;
            }
        }
        await sendingVerificationMail(fullName,userObject.email,userObject._id);
    } catch (error) {
        console.log(error.message);
    }
}

//login methods of user
const loadLogin = async function(req,res){
    try {
        res.render('login',{userMessage});
        userMessage=""
    } catch (error) {
        console.log(error.message);
    }
}

//verifying the login user
const verifyingUser = async function(req,res){
    try {
        const email = req.body.email
        const password = req.body.password;
        const userData = await User.findOne({email:email}); 
        if(userData){
            if(userData.email == email){
                const matchPass = await bcrypt.compare(password,userData.password);
                if(matchPass){
                    // if(userData.is_verified === 1){
                        // if(userData.isBlocked == false){
                            req.session.user= userData.id;
                            isLoggedIn=true
                            userHomeId = userData._id;
                            res.redirect('/');
                        // }else{
                            // userMessage ="Account temporarily blocked"
                            // res.redirect('/login')
                        // }
                    // }else{
                    //     userMessage ="Please verify Your mail"
                    //     res.redirect('/login')
                    // }
                }else{
                    userMessage ="invalid Creditials"
                    res.redirect('/login')
                }
            }else{
                userMessage ="invalid Creditials"
                res.redirect('/login')
            }
        }else{
            userMessage ="invalid User"
            res.redirect('/login')
        }
    } catch (error) {
        console.log(error.message);
    }
}

//rendering home
const loadHome = async function(req,res){
    try {
        // const userId = req.session.user;
        const banners = await bannerModel.findOne();
        console.log(banners);
        const gamesData = await GamesModels.find().lean();
        // cartCount = await findTheCartItmes(userId);
        // cartCount = cartCount.length;
        res.render('home',{isLoggedIn,gamesData,cartCount,banners});
    } catch (error) {
        console.log(error.message);
    }
}

//logging out from home
const usreLogginOut = async function(req,res){
    try {
        isLoggedIn = false
        req.session.destroy();
        res.redirect('/login');
    } catch (error) {
        console.log(error.message);
    }
}

//rendering the opt page when the user want to reset the password
const loadForgerVerification = async function(req,res){
    try {
        res.render('forgetverify');
        user_Spied=false;
    } catch (error) {
        console.log(error.message);
    }
}

//verifiying the mail for resetting the password of user
const verifyingResetPassword = async function(req,res){
    try {
        const email = req.body.email;
        userResendMail= req.body.email;
        await User.findOneAndUpdate({email:email},{$set:{is_verified:0}});
        const userFound = await User.findOne({email:email});
        if(userFound){
            const usrName = userFound.fname;
            const usrEmail = userFound.email;
            usrId = userFound._id;
            await sendingVerificationMail(usrName,usrEmail,usrId);
            res.redirect('/otpverify',);
        }else{
            console.log('error occured')
        }
    } catch (error) {
        console.log(error.message);
    }
}

//renderign the otp page 
const loadOtp = async function(req,res){
    try {
        res.render('otpverify',{userMessage,isLoggedIn});
        userMessage="";
    } catch (error) {
        console.log(error.message);
    }
}

//otp submitting and cheking the otp is satisfying
const userOtpVeriying = async function(req,res){
    try {
        let currentOtp = req.body.otp;
        if(currentOtp){
            const isTrue = await validatingOtp(currentOtp,otpChecking)
            if(isTrue){
                if(user_Spied){
                    const insertedUser = await insertingAccount(userObject)
                    if(insertedUser){
                        userMessage='SignUp completed, Please verify your mail';
                        res.redirect('/login');
                        user_Spied = false ;
                        // await User.findOneAndUpdate({email:userObject.email},{$set:{is_verified:1}});
                    }else{
                        // res.redirect('/');
                        userMessage='Invalid OTP';
                        res.redirect('/otpverify');
                    }
                }else if(editSpied){
                    const id = req.session.user;
                    const user = await userModel.findById({_id:id});
                    if(user){
                        newPassOne = await securingPassword(newPassOne);
                        const upUser = await userModel.findByIdAndUpdate({_id:id},{$set:{password:newPassOne}});
                        sccMsg = 'Successfully Changed Your Password..!'
                        res.redirect('/userprofile');
                        editSpied = false ;
                    }
                }else{
                    res.redirect('/resetpassword');
                }
            }else{
                userMessage='Invalid OTP';
                res.redirect('/otpverify');
            }
        }else{

        }
    } catch (error) {
        console.log(error.message);
    }
}

// resetting the password
const loadResetPassword = async function(req,res){
    try {
        res.render('resetpassword',{usrId,userMessage});
        userMessage = '';
    } catch (error) {
        console.log(error.message);
    }
}

//resetting the password when user click reset
const resettingPassword = async function(req,res){
    try {
        const newPassword = req.body.password;
        const usrPassTwo = req.body.password2;
        const ID = req.body.hiddenId;
        if(newPassword == usrPassTwo){
            const upEncPassword = await securingPassword(newPassword);        
            const updatedUser = await  User.findByIdAndUpdate({_id:ID},{$set:{password:upEncPassword}});
            if(updatedUser){
                sccMsg = 'Successfully Changed The Password..!'
                res.redirect('/login');
            }
        }else{
            userMessage = 'Password Does Not Match..!'
            res.redirect('/resetpassword')
        }
    } catch (error) {
        console.log(error.message);
    }
}

//user edit and update
const loadUserProfile = async function(req,res){
    try {
        const userDatas = await User.findById({ _id:userHomeId});
        const userFullname = userDatas.fname+" "+userDatas.lname
        const gameDatas = await GamesModels.find({isDownload:true});
        res.render('userprofile',{userDatas,userFullname,userHomeId,gameDatas,userMessage,sccMsg,cartCount})
        userMessage = '';
        sccMsg = '';
    } catch (error) {
        console.log(error.message);
    }
}

//rendering the edit profile of user
const loadEditProfile = async function(req,res){
    try {
        const userCurrentId = req.body.userBodyId;
        const userUpData = await User.findById({_id:userCurrentId});
        res.redirect('/edituser?id='+userCurrentId);
    } catch (error) {
        console.log(error.message);
    }
}

//rendering the edit page
const laodProfileEdit = async function(req,res){
    try {
        const Id = req.query.id;
        const userUpData = await User.findById({_id:Id});
        res.render('edituserprofile',{userUpData,userMessage});
        userMessage = '';
    } catch (error) {
        console.log(error.message);
    }
}

//updating the user while the posting from the edit page 
const updateUserDetails = async function(req,res){
    try {
        // const userEmail = req.body.email;
        console.log('--------------------------------488');
        const userId = req.session.user;
        if(userId){
            const userFound = await User.findById({email:userEmail});
            if(userFound != null){
                const updatedUser = await User.findByIdAndUpdate(
                    {_id:userId},
                    {
                      fname:req.body.fname,
                      lname:req.body.lname , 
                      email:req.body.email,
                      mobile:req.body.mobile,
                    }
                );
                res.redirect('/userprofile');
            }else if(userFound == null){
                //want to fix the else condition
                userMessage = 'Email ID not exist';
                res.redirect('/edituser');
            }
        }
    } catch (error) {
        console.log(error.message);
    }
}

//products page rendering 
const loadProducts = async function(req,res){
    try {
        //want to make as function
        let newCatlist = [];
        let rndomLoc = [];
        if(!req.query.search){
            gameCollection = await GamesModels.find({deleted:false}).lean();
        }else{
            gameCollection = await GamesModels.find({name:{$regex:req.query.search}});
        }
        const cates = await findTheCategories();
        for(var i=0;i<2;i++){
            rndomLoc [i] = await Math.floor(await Math.random()*cates.length);
            if(i > 0 && rndomLoc[0] == rndomLoc[i]){
                rndomLoc [i] = await Math.floor(await Math.random()*cates.length);
            }
            newCatlist[i] = cates[rndomLoc[i]];
        }
        const catGame = await GamesModels.find({category:newCatlist[0]});
        const catGameTwo = await GamesModels.find({category:newCatlist[1]});
        res.render('products',{games:gameCollection,catGame,catGameTwo,newCatlist,cartCount,input:req.query.search});
        search = false;
    } catch (error) {
        console.log(error.message);
    }
}

//lading error page
const loadErrorPage = async function(req,res){
    try {
        res.render('error');
    } catch (error) {
        console.log(error.message);
    }
}

//downloading the game 
const downloadingGame = async function(req,res){
    try {
        //  const gameDownloaded = await 
    } catch (error) {
        console.log(error.message);
    }
}

//loading the checkoutpage
const loadingCheckout = async function(req,res){
    const dis = 100;
    try {
        const gameId = req.query.id;
        console.log("first")
        console.log("gameid"+gameId);
        const userId = req.session.user;
        const theGame = await GamesModels.findById({_id:gameId});
        const theUser = await userModel.findById({_id:userId});
        const fullname = theUser.fname+" "+theUser.lname;
        const finalAmount = theGame.price - dis;
        const gmUpdation = theGame.gameVersions;
        lengthOfUp = gmUpdation.length;
        const lastUpdate = gmUpdation[lengthOfUp-1];
        if(theGame){
            console.log("the game ")
            res.render('productview',{theGame,theUser,fullname,finalAmount,dis,cartCount,gmUpdation,lastUpdate});
        }
    } catch (error) {
        console.log(error.message);
    }
}

//rendering the payment 
const loadPayment = async function(req,res){
    const dis = 100;
    try {
        const gameId = req.query.id;
        const userId = req.session.user;
        const theGame = await GamesModels.findById({_id:gameId});
        const theUser = await userModel.findById({_id:userId})
        const lastPrice = theGame.price - dis;
        const newPrice = lastPrice - 5.80;
        req.session.gameID = gameId ;
        res.render('checkout',{theGame,theUser,lastPrice,newPrice,cartCount});
    } catch (error) {
        console.log(error.message)
    }
}

//sendint the details and rendering the paying page
const proceedToPay = async function(req,res){
    try {
        
    } catch (error) {
        console.log(error.message);
    }
}

//loading game when click load and play
const loadGame = async function(req,res){
    try {
        res.render('gameload',setTimeout(loadHome,5000))
    } catch (error) {
        console.log(error.message);
    }
}

//creating a new order when userclick proceed to pay
const createNeworder = async function(req,res){
    try {
    console.log("call in js")
        console.log(req.body)
        let productPrice = req.body.amount;
        productPrice = parseInt(productPrice);
        const instance = new Razorpay({ key_id: 'rzp_test_qmjEny8LnAs8hb', key_secret: '0Bg7w3NJUvynTzMpA9QYzahK' })
        const Order = await instance.orders.create({
            amount: productPrice,
            currency: "INR",
            receipt: req.body.userName,
        })
        if(Order){
            console.log('order confirmed....................634');
            const orderDetails = req.body;
            console.log(req.body);
            const usId = req.session.user;
            const gamId = req.body.gameId;
            const game = await GamesModels.findById({_id:gamId});
            const user = await userModel.findById({_id:usId});
            const orderName = user.fname+user.lname+"/"+game.name;
            const orderData = await creatingOrder(usId,gamId,orderDetails,Order);
            console.log(orderData);
        }
        res.json({Order,instance});

    } catch (error) {
        console.log(error.message);
    }
}

//rendering the payment success page
const loadPaymentSuccess = async function(req,res){
    try {
        const game = req.session.gameID;
        const user = req.session.user;
        console.log("session"+req.session);
        const theGameData = await GamesModels.findById({_id:game});
        const theUserData = await userModel.findById({_id:user});
        const fullname = theUserData.fname+" "+theUserData.lname;
        res.render('payment',{theGameData,theUserData,fullname,cartCount});
    } catch (error) {
        console.log(error.message);
    }
}

//loading the car page
const loadCart = async function(req,res){
    try {
        const userID = req.session.user;
        let cartItem = await userModel.findById({_id:userID},{cartItems:1,_id:0});
        cartItem = cartItem.cartItems
        cartCount = cartItem.length;
        let WholeSum = 0;
        for(i=0;i<cartItem.length;i++){
            WholeSum = WholeSum+cartItem[i].price
        }
        res.render('cart',{cartItem,WholeSum,cartCount,userID});
    } catch (error) {
        console.log(error.message);
    }
}

//posting item to the cart 
const creatingCartItem = async function(req,res){
    try {
        console.log("create cart------------------706");
        var flag = 0 ;
        const id = req.session.user;
        let productId = req.body.hiddenGmId;
        let currentGame = await GamesModels.findById({_id:productId})
        // let users = await userModel.findById({_id:id});
        const gameIdiesCart = await findTheCartItmes(id);
        cartCount = gameIdiesCart.length;
        for(var i =0;i<gameIdiesCart.length;i++){
            if(productId == gameIdiesCart[i]){
                flag = 1;
                break;
            }else if(productId != gameIdiesCart[i]){
                flag = 0;
            }
        }
        if(flag == 0){
            const cartUp = await userModel.updateOne({_id:id},
                {$addToSet:
                    {cartItems:
                        {   
                            gameId:currentGame._id,
                            userId:id,
                            gameName:currentGame.name,
                            gameCat:currentGame.category,
                            price:currentGame.price,
                            gameImage:currentGame.image
                        }
                    }
                }
            )
        }else{
            update = false;
            console.log("else_______________________________ flag = 1");
        }
        const gamesOfusr = await findTheCartItmes(id);
        cartCount = gamesOfusr.length;
        console.log(cartCount);
        if(req.body.fromFetch){
            res.json({cartCount});
        }else{
            res.redirect('/cart');
        }
    } catch (error) {
        console.log(error.message);
    }
}

//resetting the user password
const editPassword = async function(req,res){
    try {
        const userIdPsd = req.session.user;
        const theCurrUser = await userModel.findById({_id:userIdPsd});
        if(theCurrUser){
            const enUsrPass = req.body.crPassword;
            const passMatch = await bcrypt.compare(enUsrPass,theCurrUser.password);
            if(passMatch){
                newPassOne = req.body.newPassOne;
                const newPassTwo = req.body.newPassTwo;
                if(newPassOne == newPassTwo){
                    const userName = theCurrUser.fname+' '+theCurrUser.lname;
                    await sendingVerificationMail(userName,theCurrUser.email,userIdPsd);
                    res.redirect('/otpverify');
                    editSpied = true;
                }else{
                    userMessage = 'Can not Change.! New Passwords Does Not Match';
                    res.redirect('/userprofile');
                }
            }else{
                userMessage = 'Can not Change.! Current Password is Incorrect';
                res.redirect('/userprofile');
            }
        }
    } catch (error) {
        console.log(error.message)
    }
}

//deleting a itme from the cart 
const deleteCartItem = async function(req,res){
    try {
        const userID = req.session.user;
        const cartGameId = req.body.cartGameId;
        console.log(req.body);
        console.log(cartGameId+"gameid of 754 ----------------------------------");
        const user = await userModel.findById({_id : userID})
        let userCart = user.cartItems;
        for(var i=0;i<userCart.length;i++){
            if( userCart[i]._id == cartGameId){
                break;
            }
        }
        userCart.splice(i,1);
        const newUpUser = await userModel.findByIdAndUpdate({_id : userID},{$set:{cartItems:userCart}});
        const gamesOfusr = await findTheCartItmes(newUpUser._id);
        //want manage the deletion of game and view of priduct cart button
        // await GamesModels.updateOne({name:gameName},{$set:{inCart:false}});
        cartCount = gamesOfusr.length;
        res.json({cartCount});
    } catch (error) {
        console.log(error.message);
    }
}

const googleAuth = async function(req,res){
    try {
        const email = req.user.emails[0].value;
        const userData = await User.findOne({email:email}); 
        if(userData){
            if(userData.email == email){
                // const matchPass = await bcrypt.compare(password,userData.password);
                // if(matchPass){
                    // if(userData.is_verified === 1){
                        // if(userData.isBlocked == false){
                            req.session.user= userData.id;
                            isLoggedIn=true
                            userHomeId = userData._id;
                            res.redirect('/');
                        // }else{
                            // userMessage ="Account temporarily blocked"
                            // res.redirect('/login')
                        // }
                    // }else{
                    //     userMessage ="Please verify Your mail"
                    //     res.redirect('/login')
                    // }
                // }else{
                //     userMessage ="invalid Creditials"
                //     res.redirect('/login')
                // }
            }else{
                userMessage ="invalid Creditials"
                res.redirect('/login')
            }
        }else{
            userMessage ="invalid User"
            res.redirect('/login')
        }
        res.redirect('/')
    } catch (error) {
        console.log(error.message);
    }
}

//resending the otp when user exceed the time limit
const resendOtp = async function(req,res){
    try {
        let userData;
        if(user_Spied){
            const email = userObject.email;
            userData = await userModel.findOne({email:email});
            console.log(email+"________________________836");
        }else if(editSpied){
            const userId = req.session.user;
            userData = await userModel.findOne({_id:userId});
            console.log(userId+"____________________840");
        }else{
            userData = await userModel.findOne({email:userResendMail});
            console.log(userResendMail,"+++++++++++++844");
        }
        await sendingVerificationMail(userData.fname,userData.email,userData._id);
        res.redirect('/otpverify',);
    } catch (error) {
        console.log(error.message);
    }
}

//checking the coupon is valid or not
const checkingTheCouponValidity = async function(req,res){
    try {
        const couponCode = req.body.inpCoupon;
        console.log('..........873',couponCode);
        coupn = '000000';
        res.json({coupn})
    } catch (error) {
        console.log(error.message);
    }
}


module.exports={
    //sugnup is verified on bug
    loadSignup,
    creatingUser,
    verifyMail,
    loadLogin,
    verifyingUser,
    loadHome,
    usreLogginOut,
    loadForgerVerification,
    verifyingResetPassword,
    loadResetPassword,
    resettingPassword,
    loadOtp,
    userOtpVeriying,
    loadUserProfile,
    loadEditProfile, 
    laodProfileEdit, 
    updateUserDetails,  
    loadProducts,
    loadErrorPage,
    downloadingGame,
    loadingCheckout,
    proceedToPay,
    loadPayment,
    loadGame,
    createNeworder,
    loadPaymentSuccess,
    loadCart,
    creatingCartItem,
    editPassword,
    deleteCartItem,
    googleAuth,
    resendOtp,
    checkingTheCouponValidity,
    //resend otp want to fix there is a bug on the redirection the otp checking variable want to clear after 59 sec finish
}