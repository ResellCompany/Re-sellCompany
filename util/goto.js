module.exports = {
    go:function(req, res, obj){
        let loginid, loginname;
        if(req.user){
            loginid = req.user.id;
            loginname = req.user.name;
        }
        if(loginid != undefined){
            if(obj != undefined){
                obj.loginid = loginid;
                // {,'loginid':loginid}
                res.render('main',obj);
            }else{
                res.render('main',{'loginid':loginid});
            }
        }else{
            if(obj != undefined){
                res.render('main',obj);
            }else{
                res.render('main');
            }
        }                           
    } // end go function
}