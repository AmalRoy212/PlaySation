const express = require ('express');
const adminRouter = express();
const adminController = require('../controllers/adminController');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const session = require('express-session');
const config = require('../config/config');
const auth = require('../middleware/adminAuth');

adminRouter.use(session({
    secret:config.sessionSecrect,
    isDeleting:false,
    resave: true,
    saveUninitialized: true
}));

const publicPath = path.join(__dirname, '../public');
// adminRouter.use('/games',express.static('./public/gameimages'));
//setting the view engine for the user
adminRouter.set('views', './views/admin');
//url encoding
adminRouter.use(bodyParser.json());
adminRouter.use(bodyParser.urlencoded({extended:true}));
//setting multer for store images
const storage = multer.diskStorage({
    destination:function(req,file,callback){
        callback(null,publicPath  + '/gameimages');
        // callback(null, '/../../public/gameimages');
    },
    filename:function(req,file,callback){
        const name = Date.now()+'-'+file.originalname;
        callback(null,name);
    }
})
const upload = multer({storage:storage});

//setting multer for storing the video data
const videoStorage = multer.diskStorage({
    destination:function(req,file,callback){
        callback(null,publicPath + '/gameVideos');
        // callback(null, '/../../public/gameimages');
    },
    filename:function(req,file,callback){
        const name = Date.now()+'-'+file.originalname;
        callback(null,name);
    }
})
const videoUpload = multer({storage:videoStorage})
// const videoUpload = multer({
//     storage: videoStorage,
//     fileFilter: function (req, file, cb) {
//       if (file.mimetype !== 'video/mp4') {
//         return cb(new Error('Only MP4 videos are allowed.'), false);
//       }
//       cb(null, true);
//     }
//   });

adminRouter.get('/',auth.isAdminLogout,adminController.loadLogin);
adminRouter.post('/',adminController.verfyingAdmin);
adminRouter.get('/home',auth.isAdminLogin,adminController.laodAdminHome);
adminRouter.get('/games',auth.isAdminLogin,adminController.loadGameProducts);
adminRouter.get('/addgames',auth.isAdminLogin,adminController.addNewGamesLoad);
adminRouter.post('/addgames',upload.array('images',3),adminController.addGameData);
adminRouter.post('/search',auth.isAdminLogin,adminController.findigGames);
adminRouter.post('/edit',auth.isAdminLogin,adminController.loadGameEdit);
adminRouter.post('/update-game',auth.isAdminLogin,upload.array('images',3),adminController.updateGames);
adminRouter.get('/usertable',auth.isAdminLogin,adminController.loadUserDataTable);
adminRouter.get('/block',auth.isAdminLogin,adminController.blockManagment);
adminRouter.get('/unblock',auth.isAdminLogin,adminController.unblock);
adminRouter.post('/softdelete',auth.isAdminLogin,adminController.softDeleteData);
adminRouter.post('/undoDelete',auth.isAdminLogin,adminController.undoDetelition)
adminRouter.post('/delete',auth.isAdminLogin,adminController.deleteGames);
adminRouter.get('/categories',auth.isAdminLogin,adminController.laodCategories);
adminRouter.post('/categories',auth.isAdminLogin,adminController.addingNewCategory);
adminRouter.get('/categoriesTable',auth.isAdminLogin,adminController.loadCategoryTable);
adminRouter.post('/deleteCategory',auth.isAdminLogin,adminController.deleteCategory);
adminRouter.post('/editCategories',auth.isAdminLogin,adminController.updateCategory);
adminRouter.post('/unverfyUser',auth.isAdminLogin,adminController.unverfyUser);
adminRouter.post('/verifyUser',auth.isAdminLogin,adminController.adminVerfyingUser);
adminRouter.get('/orders',auth.isAdminLogin,adminController.loadOrders);
adminRouter.get('/videoUpload',auth.isAdminLogin,adminController.loadVideoUpdaload);
adminRouter.post('/videoUpload',auth.isAdminLogin,videoUpload.single('video'),adminController.videoUploading);
adminRouter.get('/versions',auth.isAdminLogin,adminController.loadVersionsUpdation);
adminRouter.post('/versions',auth.isAdminLogin,adminController.versionsUpdation);
adminRouter.get('/banner',auth.isAdminLogin,adminController.loadBannerPage);
adminRouter.post('/banner',auth.isAdminLogin,upload.array('images',4),adminController.addBannerImages);
adminRouter.get('/coupon',auth.isAdminLogin,adminController.loadCouponPage);
adminRouter.post('/coupon',auth.isAdminLogin,adminController.creatingCoupon);
adminRouter.get('/coupon/table',auth.isAdminLogin,adminController.loadCoponTable);
adminRouter.post('/coupon/send',auth.isAdminLogin,adminController.addingCouponsInUser);



// adminRouter.get('*',function(req,res){
//     try {
        
//     } catch (error) {
//         console.log(error.message)
//     }
// })

// adminRouter.post('/edit',adminController.updateGames);


module.exports = adminRouter;