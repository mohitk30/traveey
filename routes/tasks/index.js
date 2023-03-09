const express = require("express")
const router = express.Router()
const sequelize =require('../../config/mysql-connection')
// const Tasks  =require('../../mysqlModels/tasks')(sequelize) 
const {Tasks} =require('../../mysqlModels/models')(sequelize)
 
// {"taskDetails":{
//     "title":"mk",
//     "description":"kkk",
//     "dueDate":"2016-01-01 00:00:00+00:00",
//     "employeeId":"123"

// }}


router.post('/add', async (req, res) => { 
    try {  
        const taskData=req.body.taskDetails;  
        const tasks = await Tasks.create(taskData); 
        res.send({ message: 'Task Added', status: '200' });
    } catch (error) {
        // console.log(error);
        res.send({ status: '404',error:error.message }); 
    }
})

// update a task
router.post('/update', async (req, res) => {  
    try {  
         
        const taskData=req.body.taskDetails;  
        const task = await Tasks.update({
              title:taskData.name, 
              description:taskData.description,
              dueDate:taskData.dueDate,
              employeeId:taskData.employeeId
        },{
            where:{
                id:taskData.id
            }
        }); 
        res.send({ message: 'Task Updated Successfully.', status: '200' });
    } catch (e) {
        // console.log(e.message);
        res.send({ status: '404',error: e.message});
    }
})

router.post('/delete', async (req, res) => { 
    try {  
        const taskId=req.body.taskId;  
        const tasks = await Tasks.destroy({where:{id:taskId}}); 
        res.send({ message: 'Task Deleted', status: '200' });
    } catch (error) {
        // console.log(error);
        res.send({ status: '404' ,error: error.message});
    }
})

// to render  all the tasks

router.get('/view', async (req, res) => { 
    try {  
        const tasks = await Tasks.findAll({}); 
        res.send({ postedTasks: tasks, status: '200' });
    } catch (error) {
        // console.log(error);
        res.send({ status: '404' });
    }
})
// to view tasks of a specific employee
router.get('/view/:id', async (req, res) => { 
    try {  
        const taskId=req.params.id;
        const tasks = await Tasks.findAll({where: {
            id:taskId
          }}); 
        res.send({ postedTasks: tasks, status: '200' });
    } catch (error) {
        // console.log(error);
        res.send({ status: '404',error:error.message });
    }
})


module.exports = router