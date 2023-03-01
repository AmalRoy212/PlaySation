
//user loggin session mamangment
const isLogin = async function(req,res,next){
    try {
        if(req.session.user){
        }
        else{
            res.redirect('/login');
        }
        next();
    } catch (error) {
        console.log(error.message);
    }
}
const isLogout = async function(req,res,next){
    try {
        if(req.session.user){
            res.redirect('/');
        }
        next();
    } catch (error) {
        console.log(error.message);
    }
}

module.exports ={
    isLogin,
    isLogout
}