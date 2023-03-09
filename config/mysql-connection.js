const { Sequelize } = require('sequelize');

 const dbInfo={
    database:'travey',
    username:'mknode',
    password:'password',
    host:'localhost',
    dialect: 'mysql'
 }
 
const sequelize = new Sequelize(dbInfo.database, dbInfo.username, dbInfo.password, {
  host: dbInfo.host,
  dialect: dbInfo.dialect,
  logging: false, // comment this line to see all logs
});

module.exports=sequelize