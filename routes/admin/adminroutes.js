const express = require("express")
const router = express.Router()
const AdminModel = require('../../models/admins');
 
router.post('/login', async (req, res) => { 
    try {  
        const loginData=req.body.loginInfo;  
        const credentialsUserName=loginData.userName;
        const credentialsUserPassword=loginData.userPassword; 
 
        const allAdmin = await AdminModel.find({}); 


        res.send({ admins: allAdmin, status: '200' });
    } catch (error) {
        console.log(error);
        res.send({ status: '404' });
    }
})


module.exports = router