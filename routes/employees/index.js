const express = require("express") 
const router = express.Router() 
const sequelize =require('../../config/mysql-connection')  

const {Employee} =require('../../mysqlModels/models')(sequelize)

  

// add a new employee
router.post('/add', async (req, res) => {  
    try {  
         
        const employeeData=req.body.employeeDetails;  
        const employee = await Employee.create(employeeData); 
        res.send({ message: 'Employee Added Successfully.', status: '200' });
    } catch (e) {
        // console.log(e.message);
        res.send({ status: '404',error: e.message});
    }
})

// update a new employee
router.post('/update', async (req, res) => {  
    try {  
         
        const employeeData=req.body.employeeDetails;  
        const employee = await Employee.update({
              name:employeeData.name,
              email:employeeData.email,
              phone:employeeData.phone,
              hireDate:employeeData.hireDate,
              position:employeeData.position
        },{
            where:{
                id:employeeData.id
            }
        }); 
        res.send({ message: 'Employee Updated Successfully.', status: '200' });
    } catch (e) {
        // console.log(e.message);
        res.send({ status: '404',error: e.message});
    }
})

// delete a employee
router.post('/delete', async (req, res) => { 
    try {  
        const employeeID=req.body.employeeID;  
        const employee = await Employee.destroy({where:{id:employeeID}}); 
        res.send({ message: 'Employee Deleted Successfully.', status: '200' });
    } catch (error) {
        // console.log(error);
        res.send({ status: '404',error: error.message });
    }
})


// to view all employee details
router.get('/view/', async (req, res) => { 
    try {   
        const employees = await Employee.findAll({ }); 
        res.send({ employees: employees, status: '200' });
    } catch (error) {
        // console.log(error);
        res.send({ status: '404',error:error.message });
    }
})

// to view details of a employee 
router.get('/view/:id', async (req, res) => { 
    try {  
        const employeeID=req.params.id;
        const employee = await Employee.findAll({where: {
            employeeId:employeeID
          }}); 
        res.send({ employee: employee, status: '200' });
    } catch (error) {
        // console.log(error);
        res.send({ status: '404',error:error.message });
    }
})


module.exports = router