const mongoose=require('mongoose');
(async () =>{
    await mongoose.connect(process.env.BACKEND_DB_LINK)
})()
 