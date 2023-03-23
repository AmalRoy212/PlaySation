const AdminModel = require('../models/adminModel');
const bcrypt = require('bcrypt');
const GamesModel = require('../models/products');
const Category = require('../models/category');
const userModel = require('../models/userModel');
const OrderModel = require('../models/orderModel');
const bannerModel = require('../models/bannerModel');
const couponModel = require('../models/couponModel');
const { findOneAndUpdate } = require('../models/adminModel');
const fs = require('fs');
const { start } = require('repl');
const { months } = require('moment-timezone');


let adminMessage;
let GameProducts;
let userBlocked;
let sccMssg;
let userCoupon


//function for creating new categories
async function creatingCategories(categoryName) {
    try {
        // const newCate = await capitalizingTheFirst(categoryName)
        const newCategory = new Category({
            gameCategory: categoryName
        })
        await newCategory.save()
    } catch (error) {
        console.log(error.message);
    }
}

//refershing the Category page 
async function refershCategory() {
    try {
        const gmCates = await Category.find();
        return gmCates;
    } catch (error) {
        console.log(error.message)
    }
}

//first letter capitalising
async function capitalizingTheFirst(category) {
    try {
        const pattern = /\s*(?:&|and)\s*/i;
        category = category.trim();
        category = category.trimEnd();
        let theNewCate = pattern.test(category) ? category.split(/\s*(?:&|and)\s*/i) : category
        if (Array.isArray(theNewCate)) {
            for (var i = 0; i < theNewCate.length; i++) {
                let tempLetter = await theNewCate[i].split('');
                tempLetter[0] = await tempLetter[0].toUpperCase();
                for (var j = 1; j < tempLetter.length; j++) {
                    tempLetter[j] = tempLetter[j].toLowerCase();
                }
                tempLetter = await tempLetter.join('');
                if (i != theNewCate.length - 1) {
                    theNewCate[i] = tempLetter + " & ";
                } else {
                    theNewCate[i] = tempLetter;
                }
            }
            theNewCate = theNewCate.join('');
        } else {
            theNewCate = theNewCate.split('');
            theNewCate[0] = await theNewCate[0].toUpperCase();
            for (var i = 1; i < theNewCate.length; i++) {
                theNewCate[i] = await theNewCate[i].toLowerCase();
            }
            theNewCate = await theNewCate.join('')
        }
        return theNewCate
    } catch (error) {
        console.log(error.message)
    }
}

//finding the categories
async function findTheCategories() {
    try {
        const categoryCollection = await Category.find();
        let i = 0;
        let catNames = [];
        for (i = 0; i < categoryCollection.length; i++) {
            catNames[i] = categoryCollection[i].gameCategory
        }
        return catNames;
    } catch (error) {
        console.log(error.message);
    }
}

//adding a new game to the database
async function addingGameDatas(gameObject, imageFile) {
    try {
        const newGame = new GamesModel({
            image: imageFile,
            name: gameObject.name,
            category: gameObject.category,
            price: gameObject.price,
            designers: gameObject.designers,
            developed: gameObject.developed,
            publisher: gameObject.publisher,
            dis: gameObject.discription
        })
        const insertedGame = await newGame.save();
        return insertedGame
    } catch (error) {
        console.log(error.message);
    }
}

//refershing the gamesProduct array when the page refresh
async function refershingGameProduct() {
    try {
        const refreshed = await GamesModel.find();
        return refreshed
    } catch (error) {
        console.log(error.message);
    }
}

/*-----------rendering methods-----------------*/

//rendering the login page to admin
const loadLogin = async function (req, res) {
    try {
        res.render('login', { adminMessage });
        adminMessage = '';
    } catch (error) {
        console.log(error.message)
    }
}

//verifying the admin loaggin
const verfyingAdmin = async function (req, res) {
    try {
        const adEmail = req.body.email;
        const adPassword = req.body.password;
        const adminData = await AdminModel.findOne({ email: adEmail });
        if (adminData) {
            if (adminData.email == adEmail) {
                if (adPassword == adminData.password) {
                    req.session.adminLog = true
                    res.redirect('/admin/home')
                } else {
                    adminMessage = 'Credantials does not exist';
                    res.redirect('/admin');
                }
            } else {
                adminMessage = 'Credantials does not exist';
                res.redirect('/admin');
            }
        } else {
            adminMessage = 'Account not found';
            res.redirect('/admin');
        }
    } catch (error) {
        console.log(error.message);
    }
}

//loading the home page of admin
const laodAdminHome = async function (req, res) {
    try {
        const mnthTrgt = 100;
        const orderModelLength = await OrderModel.countDocuments();
        const users = await userModel.countDocuments();
        const wholeSales = await salesAnalytics()
        let sales = wholeSales[0];
        let profit = wholeSales[1];
        //finding the profit percentage
        let profitMargin = (profit / sales) * 100;
        profitMargin = profitMargin.toFixed(2);
        profitMargin = parseFloat(profitMargin);
        //finding the sales percentage
        let currentSales = (orderModelLength / mnthTrgt) * 100;
        currentSales = currentSales.toFixed(2);
        currentSales = parseFloat(currentSales);
        //finding the cost/disconunts percentage
        let cost = (sales - profit);
        cost = (cost / sales) * 100;
        cost = cost.toFixed(2);
        cost = parseFloat(cost);
        res.render('home', { profitMargin, orderModelLength, currentSales, cost, profit, users });
    } catch (error) {
        console.log(error.message);
    }
}

//loding the products page 
const loadGameProducts = async function (req, res) {
    try {
        GameProducts = await refershingGameProduct()
        res.render('games', { GameProducts, });
    } catch (error) {
        console.log(error.message);
    }
}

//loading the new product add page
const addNewGamesLoad = async function (req, res) {
    try {
        const catNames = await findTheCategories();
        res.render('addgames', { catNames });
    } catch (error) {
        console.log(error.message);
    }
}

//posting a new game to database 
const addGameData = async function (req, res) {
    try {
        const imageFilename = req.files.map(file => file.filename);
        const gameData = await addingGameDatas(req.body, imageFilename);
        if (gameData) {
            res.redirect('/admin/games')
        }
    } catch (error) {
        console.log(error.message);
    }
}

//search managing 
const findigGames = async function (req, res) {
    try {
        const adminSearch = req.body.search;
        GameProducts = await GamesModel.find({ name: { $regex: adminSearch } });
        if (GameProducts) {
            console.log(GameProducts);
            res.render('games', { GameProducts });
        } else {
            adminMessage = 'Search Not Found';
            res.render('games', { adminMessage });
            adminMessage = '';
        }
    } catch (error) {
        console.log(error.message);
    }
}

//loading the update page of game datas
const loadGameEdit = async function (req, res) {
    try {
        const productId = req.body.id;
        const gameData = await GamesModel.findById({ _id: productId });
        const catColl = await findTheCategories();
        if (gameData) {
            res.render('editgames', { gameData, catColl })
        }
    } catch (error) {
        console.log(error.message)
    }
}

//editing the product details
const updateGames = async function (req, res) {
    try {
        const id = req.query.id;
        let currentGames
        let imageFilename = req.files.map(file => file.filename);
        if (imageFilename.length == 0) {
            currentGames = await GamesModel.findByIdAndUpdate({ _id: id },
                {
                    $set: {
                        name: req.body.name,
                        category: req.body.category,
                        price: req.body.price,
                        designers: req.body.designers,
                        developed: req.body.developed,
                        publisher: req.body.publisher,
                        dis: req.body.discription
                    }
                }
            )
        } else {
            currentGames = await GamesModel.findByIdAndUpdate({ _id: id },
                {
                    $set: {
                        image: imageFilename,
                        name: req.body.name,
                        category: req.body.category,
                        price: req.body.price,
                        designers: req.body.designers,
                        developed: req.body.developed,
                        publisher: req.body.publisher,
                        dis: req.body.discription
                    }
                }
            )
        }
        if (currentGames) {
            GameProducts = refershingGameProduct();
            res.redirect('/admin/games');
        }

    } catch (error) {
        console.log(error.message);
    }
}

//loading the user data table 
const loadUserDataTable = async function (req, res) {
    try {
        const userData = await userModel.find({});
        res.render('users', { userData, sccMssg, adminMessage });
        sccMssg = '';
        adminMessage = '';
    } catch (error) {
        console.log(error.message);
    }
}

//blocking and unblocking the user
const blockManagment = async function (req, res) {
    try {
        const id = req.query.id;
        userBlocked = false;
        const user = await userModel.findOneAndUpdate({ _id: id }, { $set: { isBlocked: true } });
        req.session.users = '' ;
        res.redirect('/admin/usertable')

    } catch (error) {
        console.log(error.message);
    }
}

const unblock = async (req, res) => {
    try {
        const id = req.query.id;
        const user = await userModel.findOneAndUpdate({ _id: id }, { $set: { isBlocked: false } })
        userBlocked = true;
        res.redirect('/admin/usertable')
    } catch (error) {
        console.log(error);
    }
}

//soft deletion of game data
const softDeleteData = async function (req, res) {
    try {
        const id = req.body.id;
        await GamesModel.findByIdAndUpdate({ _id: id }, { $set: { deleted: true } });
        res.redirect('/admin/games');
    } catch (error) {
        console.log(error.message)
    }
}

//hard deletion of game data 
const deleteGames = async function (req, res) {
    try {
        const id = req.body.id;
        const gameData = refershingGameProduct();
        await GamesModel.findByIdAndDelete({ _id: id });
        res.render('games', { gameData, });
    } catch (error) {
        console.log(error.message);
    }
}

//loading the category page 
const laodCategories = async function (req, res) {
    try {
        const currentCat = await Category.find();
        res.render('category', { currentCat, adminMessage });
        adminMessage = '';
    } catch (error) {
        console.log(error.message);
    }
}

//adding a new category to the data base 
const addingNewCategory = async function (req, res) {
    try {
        let flag = 0;
        let cate = req.body.category
        cate = await capitalizingTheFirst(cate)
        // const editCate = cate.split()
        let found = await Category.find({ gameCategory: cate });
        if (found.length == 0) {
            await creatingCategories(cate);
            sccMssg = 'The Category is Successsfully added';
            res.redirect('/admin/categories');
        } else {
            adminMessage = 'The Category is already in your list';
            res.redirect('/admin/categories');
        }
    } catch (error) {
        console.log(error.message);
    }
}

//loading the category table
const loadCategoryTable = async function (req, res) {
    try {
        const currentCat = await Category.find();
        res.render('cateTable', { currentCat, adminMessage })
        adminMessage = '';
    } catch (error) {
        console.log(error.message)
    }
}

//updating the category
const updateCategory = async function (req, res) {
    try {
        const cateId = req.body.hiddenId;
        const admnCate = req.body.category;
        await Category.findByIdAndUpdate({ _id: cateId }, { $set: { gameCategory: admnCate } });
        adminMessage = 'Successfully Edited..!'
        res.redirect('/admin/categoriesTable')
    } catch (error) {
        console.log(error.message);
    }
}

//deleting the categories
const deleteCategory = async function (req, res) {
    try {
        const categid = req.body.categoryId;
        await Category.findByIdAndDelete({ _id: categid });
        adminMessage = 'Successfully Deleted..!'
        res.redirect('/admin/categoriesTable')
    } catch (error) {
        console.log(error.message)
    }
}

//unverfiying user
const unverfyUser = async function (req, res) {
    try {
        const userId = req.query.id;
        const unVfdUse = await userModel.findByIdAndUpdate({ _id: userId }, { $addToSet: { is_verified: 0 } });
        if (unVfdUse) {
            sccMssg = 'Successfully Unverified User';
            res.redirect('/admin/usertable');
        } else {
            adminMessage = 'Cannot Find the Data';
            res.redirect('/admin/usertable');
        }
    } catch (error) {
        console.log(error.message);
    }
}

//verfying the user from the admin side
const adminVerfyingUser = async function (req, res) {
    try {
        const userId = req.query.id;
        const upUser = await userModel.findByIdAndUpdate({ _id: userId }, { $addToSet: { is_verified: 1 } });
        if (upUser) {
            sccMssg = 'Successfully Verified User';
            res.redirect('/admin/usertable');
        } else {
            adminMessage = 'Cannot Find the Data'
            res.redirect('/admin/usertable');
        }

    } catch (error) {
        console.log(error.message)
    }
}

//undo deletion of product 
const undoDetelition = async function (req, res) {
    try {
        const id = req.body.id;
        await GamesModel.findByIdAndUpdate({ _id: id }, { $set: { deleted: false } });
        res.redirect('/admin/games');
    } catch (error) {
        console.log(error.message);
    }
}

//loading the oder page 
const loadOrders = async function (req, res) {
    try {
        const ordersData = await OrderModel.find();
        res.render('orders', { ordersData });
    } catch (error) {
        console.log(error.message);
    }
}

//loading the video uploading page 
const loadVideoUpdaload = async function (req, res) {
    try {
        const gameId = req.query.id;
        res.render('videoupload', { gameId });
    } catch (error) {
        console.log(error.message);
    }
}

//uplaoding new video 
const videoUploading = async function (req, res) {
    try {
        const video = req.file.filename;
        const gameId = req.body.hiddenGmId;
        const newVideoUp = await GamesModel.findByIdAndUpdate({ _id: gameId }, { $set: { video: video } });
        res.redirect('/admin/games');
        console.log(video, "----------455---------", gameId);
    } catch (error) {
        console.log(error.message);
    }
}

//managin the version controlling page loading
const loadVersionsUpdation = async function (req, res) {
    try {
        const gameid = req.query.id;
        res.render('newversion', { gameid });
    } catch (error) {
        console.log(error.message);
    }
}

//updating the version of game
const versionsUpdation = async function (req, res) {
    try {
        const gameid = req.body.hiddenGmId;
        const gmVersion = req.body.version;
        const aboutGm = req.body.aboutGame;
        const vrsnDetails = req.body.versionDetails;
        const platform = req.body.platform;
        const date = new Date();
        const dtFormat = date.toLocaleDateString();
        const theGame = await GamesModel.findById({ _id: gameid });
        if (theGame) {
            await GamesModel.findByIdAndUpdate({ _id: gameid },
                {
                    $addToSet: {
                        gameVersions: {
                            version: gmVersion,
                            dateOfVersion: dtFormat,
                            platform: platform,
                            aboutGame: aboutGm,
                            versionDetails: vrsnDetails,
                        }
                    }
                })
            res.redirect('/admin/games');
        }
    } catch (error) {
        console.log(error.message);
    }
}

//loding banner managin page 
const loadBannerPage = async function (req, res) {
    try {
        res.render('addBanner', { adminMessage });
    } catch (error) {
        console.log(error.message);
    }
}

//psting the banner images on the databse 
const addBannerImages = async function (req, res) {
    try {
        const imageFilename = req.files.map(file => file.filename);
        console.log(imageFilename);
        if (imageFilename) {
            await bannerModel.findOneAndUpdate({ $set: { image: imageFilename } });
        }
        adminMessage = 'SuccesFully Uploaded the Banner Images';
        res.redirect('/admin/banner')
    } catch (error) {
        console.log(error.message);
    }
}
//loading the coupon page
const loadCouponPage = async function (req, res) {
    try {
        const couponCodes = await couponModel.find();
        res.render('coupons', { couponCodes, adminMessage, sccMssg });
        adminMessage = '';
        sccMssg = ''
    } catch (error) {
        console.log(error.message);
    }
}

//adding new coupon in database
const creatingCoupon = async function (req, res) {
    try {
        let coupon = req.body.couponCode;
        let flag = 0;
        coupon.trimEnd();
        coupon = coupon.toUpperCase();
        console.log(coupon);
        let discountAmount = req.body.discountAmount;
        const expDate = req.body.expDate;
        const availability = req.body.availability;
        const minAmount = req.body.mintAmount
        let date = new Date();
        date = date.toLocaleDateString();

        const coupons = await couponModel.find({}, { _id: 0, couponCode: 1 })
        coupons.forEach((element) => {
            if (element.couponCode == coupon) {
                flag = 1;
            }
        });

        if (flag == 0) {
            const newCoupon = new couponModel({
                couponCode: coupon,
                couponDiscount: discountAmount,
                createdON: date,
                expDate: expDate,
                availability: availability,
                minAmount: minAmount
            });
            const couponCode = await newCoupon.save();
            if (couponCode.availability == 'common') {
                await userModel.updateMany({ $addToSet: { coupons: couponCode.couponCode } });
                await couponModel.findByIdAndUpdate({ _id: couponCode.id }, { isCommon: true });
            }
            sccMssg = 'Coupon Successfully Added'
            res.redirect('/admin/coupon');
        } else {
            adminMessage = 'The Coupon is already there in you list'
            res.redirect('/admin/coupon');
        }

    } catch (error) {
        console.log(error.message);
    }
}

//loding the coupon table 
const loadCoponTable = async function (req, res) {
    try {
        const coupons = await couponModel.find();
        const user = await userModel.find({}, { _id: 1, fname: 1, lname: 1, email: 1, coupons: 1 });
        const userCoupon = user.coupons;
        user.forEach((element) => {
            element.fname = element.fname + " " + element.lname;
        })
        res.render('couponTable', { coupons, user, sccMssg });
        sccMssg = '';
    } catch (error) {
        console.log(error.message);
    }
}

//sending the coupons to user 
const addingCouponsInUser = async function (req, res) {
    try {
        const couponId = req.body.id;
        const user = req.body.users;
        const couponCode = await couponModel.findById({ _id: couponId });
        const notification = `You got a surprise Coupon from PlayStation. Your coupon code  ${couponCode.couponCode}`
        const theUser = await userModel.findOneAndUpdate({ email: user }, { $addToSet: { coupons: couponCode.couponCode, notifications: notification } });
        //get the use id and manage the array of sending the user while rendering the coupon table
        sccMssg = 'Succesfully Sent to user'
        res.redirect('/admin/coupon/table');
    } catch (error) {
        console.log(error.message);
    }
}

//finding the coupons 
const fidingCoupon = async function (req, res) {
    try {
        const coupCode = req.body.currentCoupon;
        const theCoupon = await couponModel.find({ couponCode: coupCode });
        res.json({ theCoupon })
    } catch (error) {
        console.log(error.message);
    }
}

//deteing coupon
const deleteCoupon = async function (req, res) {
    try {
        const coupon = req.body.deleteCoupon;
        await couponModel.findOneAndDelete({ _id: coupon });
        res.redirect('/admin/coupon/table');
    } catch (error) {
        console.log(error.message);
    }
}

//deactivaing the coupon
const deactivateCoupon = async function (req, res) {
    try {
        const coupon = req.body.deleteCoupon;
        await couponModel.findOneAndUpdate({ _id: coupon }, { isActive: false });
        res.redirect('/admin/coupon/table');
    } catch (error) {
        console.log(error.message);
    }
}

//activating the coupon
const activateCoupon = async function (req, res) {
    try {
        const coupon = req.body.deleteCoupon;
        await couponModel.findOneAndUpdate({ _id: coupon }, { isActive: true });
        res.redirect('/admin/coupon/table');
    } catch (error) {
        console.log(error.message)
    }
}

//findin the sales report
const topSaleGames = async function (req, res) {
    try {
        const mostDown = await GamesModel.find({}, { _id: 0, name: 1, downloads: 1 }).sort({ downloads: -1 }).limit(7).lean()
        let gameNames = []
        let gameDownloades = []
        mostDown.forEach((element) => {
            gameNames.push(element.name)
            gameDownloades.push(element.downloads)
        })
        const revanue = await totalSales();
        let revanueData = [];
        let revanueGame = [];
        revanue.forEach((element) => {
            revanueData.push(element.total);
            revanueGame.push(element.name);
        })
        /*IMP__________----------This not ness cos the block which hiiden in the home is going display after getting the 
        response from the date filtered fetch call */
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1;
        const day = today.getDate();
        const formattedDate = year + '-' + (month < 10 ? '0' + month : month) + '-' + (day < 10 ? '0' + day : day);
        let ordersByDate = await OrderModel.find({ orderDate: { $gte: new Date(formattedDate) } });
        if (!ordersByDate) {
            ordersByDate = "No Orders For Today";
        }
        res.json({
            gameNames,
            gameDownloades,
            revanueData,
            revanueGame,
            ordersByDate
        })
    } catch (error) {
        console.log(error.message);
    }
}

//getting the whole order data for pdf donwloading
const getOrderData = async function (req, res) {
    try {
        const fullOrderDetails = await OrderModel.find().lean();
        res.json(fullOrderDetails);
    } catch (error) {
        console.log(error.message);
    }
}

//function for finding the monthly sales of game and revanue
async function totalSales() {
    try {
        // const mostDown = await GamesModel.find({}, { _id: 0, name: 1, downloads: 1 }).sort({ downloads: -1 }).limit(7).lean();
        const revanueMakers = await GamesModel.aggregate([
            {
                $project: {
                    _id: 0,
                    name: 1,
                    price: 1,
                    downloads: 1,
                    total: { $multiply: ["$price", "$downloads"] }
                }
            },
            {
                $sort: {
                    total: -1
                }
            },
            {
                $limit: 7
            }
        ]);
        return revanueMakers
    } catch (error) {
        console.log(error.message);
    }
}

//managing the sales report by the time period
const generateSales = async function (req, res) {
    try {
        let newDataByDate;
        let orderTotal = [];
        let gameName = [];
        let salesPerc = [];
        let inpCost = [];

        if (req.body) {
            newDataByDate = await OrderModel.find({ orderDate: { $gte: new Date(req.body.from), $lte: new Date(req.body.to) } }).sort({ orderDate: 1 });
            if (newDataByDate) {
                // const newDate = new Date(req.body.from);
                // const month = newDate.getMonth();
                // const year = newDate.getFullYear();
                // const backDate = year + '-' + (month < 10 ? '0' + month : month) + '-' + '01';
                // const nMonth = newDate.getMonth() + 1;
                // const toBack = year + '-' + (nMonth < 10 ? '0' + nMonth : nMonth) + '-' + '01'
                // const lastMonth = await OrderModel.find({ orderDate: { $gte: new Date(backDate), $lte: new Date(toBack) } });
                let count = 1;
                let end = 0;
                for (var i = 1; i <= newDataByDate.length; i++) {
                    let sum = 0;
                    let lstum = 0;
                    let cost = 0;
                    let strt = 1 * i;
                    i = count * 10;
                    end = i
                    for (var j = strt - 1; j < i; j++) {
                        if (j < newDataByDate.length) {
                            sum = sum + newDataByDate[j].actualPrice;
                            lstum = lstum + newDataByDate[j].total;
                            cost = newDataByDate[j].actualPrice - newDataByDate[j].total;
                        }
                        else
                            break;
                    }
                    // if(count * 10 >= newDataByDate.length ){
                    //     const nend = newDataByDate.length % 10 ;
                    //     end = end - nend;
                    // }
                    inpCost.push(cost);
                    salesPerc.push(lstum);
                    orderTotal.push(sum);
                    gameName[count - 1] = strt + ' to ' + end + ' Days';
                    count++;

                }
            }
        }
        res.json({
            newDataByDate,
            orderTotal,
            gameName,
            salesPerc,
            inpCost,
        })
    } catch (error) {
        console.log(error.message);
    }
}

//finding the total sale and profit of the sales 
const salesAnalytics = async function (req, res) {
    try {
        let salesAmount = await OrderModel.aggregate([
            { $group: { _id: 0, salesAmount: { $sum: "$actualPrice" } } },
        ]);
        let profitAmount = await OrderModel.aggregate([
            { $group: { _id: 0, profitAmount: { $sum: "$total" } } }
        ]);
        salesAmount = salesAmount[0].salesAmount
        profitAmount = profitAmount[0].profitAmount
        return [salesAmount, profitAmount];
    } catch (error) {
        console.log(error.message);
    }
}

//filtering the data by year and month
const filterData = async function (req, res) {
    try {
        const dataFilter = req.body.dataFilter;
        let profitOfMonth = [];
        salesOfMonth = [];
        let months = [];

        if (dataFilter == 'month') {
            const newDate = new Date();
            const year = newDate.getFullYear();
            const from = year + '-' + '01-' + '01';
            const to = year + '-' + '12-' + '31'

            const monthly = await OrderModel.aggregate([
                {
                    $match: {
                        orderDate: { $gte: new Date(from), $lte: new Date(to) }
                    }
                },
                {
                    $group: {
                        _id: { year: { $year: "$orderDate" }, month: { $month: "$orderDate" } },
                        profitOfMonth: { $sum: "$actualPrice" },
                        salesOfMonth: { $sum: "$total" },
                    }
                },
                {
                    $sort: { month: 1 }
                }
            ])
            monthly.sort((a, b) => {
                return a._id.month - b._id.month
            })
            monthly.forEach((element) => {
                profitOfMonth.push(element.profitOfMonth);
                salesOfMonth.push(element.salesOfMonth);
            })
            months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

        } else if (dataFilter == 'year') {
            const monthly = await OrderModel.aggregate([
                {
                    $group: {
                        _id: { year: { $year: "$orderDate" } },
                        profitOfMonth: { $sum: "$actualPrice" },
                        salesOfMonth: { $sum: "$total" },
                    }
                },
            ])
            monthly.sort((a, b) => {
                return a._id.year - b._id.year
            })
            monthly.forEach((element) => {
                profitOfMonth.push(element.profitOfMonth);
                salesOfMonth.push(element.profitOfMonth - element.salesOfMonth);
                months.push(element._id.year);
            })
            if(months.length < 10){
                for (var i= months.length;i<10;i++){
                    months.push(months[months.length-1]+1);
                }
            }
        }
        res.json({
            profitOfMonth,
            salesOfMonth,
            months,
            dataFilter
        })

    } catch (error) {
        console.log(error.message);
    }
}

// rendering the pdf page
// async function loadPdf(req,res){
//     try {
//         res.render('pdf');
//     } catch (error) {
//         console.log(error.message);
//     }
// }

//managing datas and sending to the new page
const downloadOrderPdf = async function(req,res){
    try {
        const filterType = req.body.dataFilter;
        let monthly ;
        if (filterType == 'month') {
            const newDate = new Date();
            const year = newDate.getFullYear();
            const from = year + '-' + '01-' + '01';
            const to = year + '-' + '12-' + '31'

            monthly = await OrderModel.aggregate([
                {
                    $match: {
                        orderDate: { $gte: new Date(from), $lte: new Date(to) }
                    }
                },
                {
                    $group: {
                        _id: { year: { $year: "$orderDate" }, month: { $month: "$orderDate" } },
                        profitOfMonth: { $sum: "$actualPrice" },
                        salesOfMonth: { $sum: "$total" },
                        salesCOunt:{ $sum:1}
                    }
                },
                {
                    $sort: { month: 1 }
                }
            ]);
            monthly.sort((a, b) => {
                return a._id.month - b._id.month
            });

        } else if (filterType == 'year') {
            monthly = await OrderModel.aggregate([
                {
                    $group: {
                        _id: { year: { $year: "$orderDate" } },
                        profitOfMonth: { $sum: "$actualPrice" },
                        salesOfMonth: { $sum: "$total" },
                        salesCOunt:{ $sum:1}
                    }
                },
            ]);
            monthly.sort((a, b) => {
                return a._id.year - b._id.year
            });
            
        }else if(filterType == 'check'){
            monthly = await OrderModel.aggregate([
                {
                  $match: {
                    orderDate: { $gte: new Date(req.body.from), $lte: new Date(req.body.to) }
                  }
                },
                {
                    $project:{ _id:0 }
                },
              ]);
            // monthly = await OrderModel.find({ orderDate: { $gte: new Date(req.body.from), $lte: new Date(req.body.to) } }).sort({ orderDate: 1 });

        }
        console.log(monthly,'-_________________1003');
        res.json({
            monthly,
            filterType
        })
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    loadLogin,
    laodAdminHome,
    verfyingAdmin,
    loadGameProducts,
    addNewGamesLoad,
    addGameData,
    findigGames,
    updateGames,
    loadGameEdit,
    loadUserDataTable,
    blockManagment,
    unblock,
    softDeleteData,
    deleteGames,
    laodCategories,
    addingNewCategory,
    deleteCategory,
    loadCategoryTable,
    updateCategory,
    unverfyUser,
    adminVerfyingUser,
    undoDetelition,
    loadOrders,
    loadVideoUpdaload,
    videoUploading,
    loadVersionsUpdation,
    versionsUpdation,
    loadBannerPage,
    addBannerImages,
    loadCouponPage,
    creatingCoupon,
    loadCoponTable,
    addingCouponsInUser,
    fidingCoupon,
    deleteCoupon,
    deactivateCoupon,
    activateCoupon,
    topSaleGames,
    getOrderData,
    generateSales,
    filterData,
    downloadOrderPdf
}
//user categorized view 
//admin session

//important
//want to fix the users who is eligible to send the coupon