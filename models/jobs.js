const mongoose = require('mongoose')


const jobModel = new mongoose.Schema({
    
    formFilledOnTime: { type: Number ,default: () => new Date(+new Date() + 7*24*60*60*1000)},
    name:{ type: String, required:true  },
    linkedin:{ type: String, required:true  },
    email:{ type: String, required:true  },
    jobName:{ type:String, required:true },
    jobDesc:{type:String, required:true },
    jobLink:{type:String, required:true },
    otherComments:{type:String, required:true },


}, { collection: 'JobModel' });

const jobs = mongoose.model('JobModel', jobModel);

module.exports = jobs