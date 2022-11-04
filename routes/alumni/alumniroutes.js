const express = require("express")
const router = express.Router()
const AlumniModel = require('../../models/alumni');

router.get('/public', async (req, res) => {
    try {
        const allAlumni = await AlumniModel.find({},{ name: 1, presentDesignation: 1, imageUrl:1,companyName:1, _id: 1 });
        res.send({ alumni: allAlumni, status: '200' });
    } catch (error) {
        console.log(error); 
        res.send({ status: '404',error:'Not ' });
    }
}) 


module.exports = router 