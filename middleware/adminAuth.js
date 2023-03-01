//admin session managment
const isAdminLogin = async function(req,res,next){
    try {
        if(req.session.adminLog){}
        else{
            res.redirect('/admin');
        }
        next();
    } catch (error) {
        console.log(error.message);
    }
}
const isAdminLogout = async function(req,res,next){
    try {
        if(req.session.adminLog){
            res.redirect('/admin/home');
        }
        next();
    } catch (error) {
        console.log(error.message);
    }
}

module.exports={
    isAdminLogin,
    isAdminLogout
}