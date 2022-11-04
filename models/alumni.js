const mongoose = require('mongoose')


const alumniModel = new mongoose.Schema({
    
    formFilledOnTime: { type: Number ,default: () => new Date(+new Date() + 7*24*60*60*1000)},
    name:{ type: String, required:false  },
    rollNo:{ type: String, required:false  },
    personalEmail:{ type: String, required:false  },
    registrationNo:{ type: String, required:false  },
    imageUrl:{ type: String, required:false  },
    preferredEmail:{ type: String, required:false  },
    degree:{ type: String, required:false  },
    yearOfPassing:{ type: String, required:false  },
    phoneNo:{ type: String, required:false  },
    permanentAddress:{ type: String, required:false  },
    presentDesignation :{ type: String, required:false  },
    companyName:{ type: String, required:false  },
    presentAddress:{ type: String, required:false  },
    jobDetailsOrStudies:{ type: String, required:false  },
    branch:{ type: String, required:false  },
    anyOtherInfo:{ type: String, required:false  },
    isApproved:{ type: Boolean, required:false  },
    

}, { collection: 'AlumniModel' });

const alumni = mongoose.model('AlumniModel', alumniModel);

module.exports = alumni