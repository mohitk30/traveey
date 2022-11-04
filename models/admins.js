const mongoose = require('mongoose')


const adminModel = new mongoose.Schema({
    
    formFilledOnTime: { type: Number ,default: () => new Date(+new Date() + 7*24*60*60*1000)},
    name:{ type: String, required:false  },
    email:{ type: String, required:true  },
    password:{ type: String, required:true  },
    apiKey:{ type:String, required:true },

}, { collection: 'AdminModel' });

const alumni = mongoose.model('AdminModel', adminModel);

module.exports = alumni