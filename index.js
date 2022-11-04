require("dotenv").config();
const express = require('express')
const bodyParser =require('body-parser')
const port = process.env.PORT || 7000  ;  
const app = express();
const cors = require('cors') 
app.use(express.json({ extended: true }));

require('./config/db-connection')
const alumniRoutes = require('./routes/alumni/alumniroutes')
const adminRoutes = require('./routes/admin/adminroutes')
const jobRoutes = require('./routes/jobs/jobs')
 
app.use("/v1/alumni", alumniRoutes)
app.use("/v1/admin", adminRoutes)
app.use("/v1/job", jobRoutes)

 
app.listen(port, (err) => {
    if (err)
        console.log('There is an error in running');

    console.log(`server is running at ${port}`); 
}) 
