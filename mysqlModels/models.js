const {   DataTypes } = require('sequelize');
const sequelize = require('../config/mysql-connection')


module.exports=(sequelize)=>{

//     {"employeeDetails":{
//   "name":"Mohit Kumar",
//   "email":"themohitkumarmk@gmail.com",
//   "phone":"9829906261",
//   "hireDate":"2023-01-01 00:00:00+00:00",
//   "position":"Full STack Developer"

// }}


const Employee = sequelize.define('Employee', {
    // Model attributes are defined here
    addedOn:{
        type:'timestamp',
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
    },
    id: {
      type: DataTypes.INTEGER, 
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING, 
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false
    },
    hireDate: {
      type: DataTypes.DATE,
      allowNull: false 
    }, 
    position: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    // Other model options go here
    tableName: 'employees'
  });


  
// {"taskDetails":{
//     "title":"Submit the assignment at Traveey ",
//     "description":"After completion I need to submit the assignment of Traveey ",
//     "dueDate":"2023-01-05 12:00:00+00:00",
//     "employeeId":"1"

// }}


  const Tasks = sequelize.define('Task', {
    // Model attributes are defined here
    addedOn:{
        type:'timestamp',
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
    },
    id: {
      type: DataTypes.INTEGER, 
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING, 
      allowNull: false
    },
    description : {
      type: DataTypes.STRING,
      allowNull: false
    },
    dueDate : {
      type: DataTypes.DATE,
      allowNull: false
    },
    employeeId : {
      type: DataTypes.INTEGER,
      allowNull: false 
    } 
  }, {
    // Other model options go here
    tableName: 'tasks'
  });


  // foreign key assignment 

Employee.hasMany(Tasks, { foreignKey: 'employeeId' });
Tasks.belongsTo(Employee, { foreignKey: 'employeeId' });

 return { Employee,Tasks };

}