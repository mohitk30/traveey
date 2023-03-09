require("dotenv").config();
const express = require('express')
const bodyParser =require('body-parser')
const port = process.env.PORT || 7000  ;  
const app = express();
const cors = require('cors')  
app.use(express.json({ extended: true }));
 


// sequelize 
const sequelize=require('./config/mysql-connection') 
const employeeRoutes= require('./routes/employees')
const tasksRoutes= require('./routes/tasks')


// routes
app.use("/v1/employee", employeeRoutes)
app.use("/v1/tasks", tasksRoutes)

 
app.listen(port, (err) => {
    if (err)
        console.log('There is an error in running');

    console.log(`server is running at ${port}`); 
}) 


async function testConnection(){
try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully with mysql Database.');
    await sequelize.sync({  });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

testConnection();


