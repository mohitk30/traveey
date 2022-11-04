const express = require("express")
const router = express.Router()
const JobModel = require('../../models/jobs');
 
router.post('/add', async (req, res) => { 
    try {  
        const jobData=req.body.jobDetails;  
        const job = await JobModel.create(jobData); 
        res.send({ message: 'Job Added', status: '200' });
    } catch (error) {
        // console.log(error);
        res.send({ status: '404' });
    }
})


module.exports = router