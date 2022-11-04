require("dotenv").config();
const express = require('express')
const port = process.env.PORT || 7000  ;  
const app = express();
const bodyParser = require('body-parser')
const cors = require('cors')
const dbUrl=require('./config/dbinfo');
const Grid = require('gridfs-stream');

const mongoose=require('mongoose');
// users model 
const uModel=require('./models/users');
const pModel=require('./models/policy');
const nModel=require('./models/notification');
const iModel=require('./models/images');
const iModelC=require('./models/imagesc');
const pTModel=require('./models/parentticket')
const cTModel=require('./models/childticket')

const mongodb = require('mongodb'); 
const multer  = require('multer')
const storageDoc = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './documents/')
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now()
    //   console.log(file)
      cb(null, 'policyDoc' + '.docx')
    }
  })
  
 
const uploadDocument = multer({ storage: storageDoc });
const  mammoth = require("mammoth");
const storagePpt = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './documents/')
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now()
    //   console.log(file)
    const ext = file.mimetype.split("/");

      cb(null, 'policyPpt.' + 'pptx')
    }
  })
  
 
const uploadPpt = multer({ storage: storagePpt })

var office2html = require('office2html'),
  generateHtml = office2html.generateHtml;

// var convertapi = require('convertapi')(`${process.env.CONVERT_SECRET_KEY}`);

// import {Powerpoint, Word} from 'pdf-officegen'
// const p = new Powerpoint()
 
const { PDFNet } = require('@pdftron/pdfnet-node');
 


// const connection = require("./db");
const uploadDb=require('./middleware/upload');

// send-grid requires
const sgMail = require('@sendgrid/mail');
const temp = require('./emailtemplate.js');



 
(async () =>{
    await mongoose.connect(dbUrl);
})()

let gfs;
const conn = mongoose.createConnection(dbUrl,{useNewUrlParser:true,useUnifiedTopology:true});

let gridfsBucket;
conn.once('open',async () => {
    // initialize stream
    // console.log("connection open")
    gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'photos'
    });
     gfs = await Grid(conn.db, mongoose.mongo);
     gfs.collection('photos')
});


// conn.once('open', function () {
//     var gfs = Grid(conn.db, mongoose.mongo);
   
//     // all set!
//   })

// console.log(mongoose.mongo) 

// console.log(conn);

app.use(cors());
// app.use(bodyParser.urlencoded({ extended: true }))


// app.use(express.json()) // use while pass data
// const dbConnect = require('./dbconnect')
app.use(express.json({limit: '50mb'}));
// no use
// app.use(express.bodyParser({limit: '50mb'}));

app.get('/', async(req, res) => {
    res.send('This is up and running server of Nodejs for Company wall app')
})



app.listen(port, (err) => {
    if (err)
        console.log('There is an error in running');

    console.log(`server is running at ${port}`); 
}) 


// end points





app.get('/policies', async (req,res)=>{
    // add user
    try{
    const allPolicies=await pModel.find({});
    res.send( {policies:allPolicies,status:'200'} );
   }catch (error) {
    // console.log(error);
    res.send({status:'404'});

   }

})

function sendEmailToListOfUser(users,userName,userEmail){
    // console.log(users);
    // Email function for send-grid emailing
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    const msg = {
        to: userEmail, // Change to your recipient
        from:{
           email:`Company Wall <${process.env.DEFAULT_EMAIL}>` // Change to your verified sender
        } , 
         
        subject: `${users.postedByHr} has posted a new update (Company Wall)`,
        text: 'New post on Company wall',
        html: temp(users,userName),

        // "template_id":"d-cc2f0878dd4241739eb0bddbbb606455",
        // "dynamic_template_data": {
        //     "postedBy": "Jane Doe",
        //     "postTime": "4",
        //     "postContent": "true",
        //     "date": "April 1st, 2021"
        //   }
    }
      sgMail
      .send(msg)
      .then(() => { 
        // console.log('Email sent')
      })
      .catch((error) => { 
        console.error(error)
      })
    // console.log(msg)

}


app.post('/add/post', async (req,res)=>{
    // add post
    try{

    const postData=req.body.newFullPost;
    // console.log(postData)
    const result= await pModel.create(postData);
    //  console.log(result)
    // add a notification

    const notificationData={
        postedBy:postData.postedByHr,
        postTime: postData.postOnTime,
        postTextContentByHrNotification: postData.postTextContentByHr,
        isImageAvailableNotification: postData.isImageAvailable,
        isVideoAvailableNotification: postData.isVideoAvailable,
        isDocAvailableNotification: postData.isDocAvailable,
        postId:result._id
    }

      const notificationResult= await nModel.create(notificationData);
    //   console.log(notificationResult);
    
    // email users
    if(result){
        // console.log(result.listOfUsers)  
        if(result.isNeedBroadcastEmail === true){
         //    need to broad cast emails
            if(result.isBroadCastToAll === true){
                //  get all list of users and then send email to all those
                const allUsers=await uModel.find({});
                allUsers.forEach((user)=>{
                    sendEmailToListOfUser(result,user.firstName,user.emailAddress);
                })

            }else{
                const listToEmail=result.listOfUsers;
                const allUsers=await uModel.find({});
                const userListOfEmail=allUsers.filter((user)=>{
                    return listToEmail.includes(user.emailAddress);
                })
                // console.log(userListOfEmail);
                userListOfEmail.forEach((user)=>{
                    sendEmailToListOfUser(result,user.firstName,user.emailAddress);
                })
                // sendEmailToListOfUser(result);
            }
          
        }else{
          
            // no need to send any emails
        }
    }

    res.send({status:'200'});

   }catch (error) {

    // console.log(error);
    res.send({status:'404'});

   }

})


// uploadDocument
app.post('/uploadDoc',uploadDocument.single("file"), async (req, res) => {

    // console.log(req.file)

    if (req.file === undefined) return res.send({status:404});
    // const imgUrl = `${process.env.REACT_APP_HOST_BACKEND}/images/${req.file.filename}`;
    // return res.send({status:200,imageUrl:imgUrl});
    else{
        // return res.send({status:200,imageUrl:text});
        return res.send({status:200,imageUrl:req.file.filename});

    }

});



// uploadPpt
app.post('/uploadPpt',uploadPpt.single("file"), async (req, res) => {

    // console.log(req.file)

    if (req.file === undefined) return res.send({status:404});
    // const imgUrl = `${process.env.REACT_APP_HOST_BACKEND}/images/${req.file.filename}`;
    // return res.send({status:200,imageUrl:imgUrl});
    else{
        // return res.send({status:200,imageUrl:text});

    //    const reslt= convertapi.convert('pdf', { File: './documents/policyPpt.pdf' })
    //    const data= result.file.save('./documents/policyPpt.docx');
        
     
        
        return res.send({status:200,imageUrl:req.file.filename}); 

    }
 
});






app.post('/uploadImage',uploadDb.single("file"), async (req, res) => {

    // console.log(req.file)

    if (req.file === undefined) return res.send({status:404});
    const imgUrl = `${process.env.REACT_APP_HOST_BACKEND}/images/${req.file.filename}`;
    // return res.send({status:200,imageUrl:imgUrl});
         return res.send({status:200,imageUrl:req.file.filename});

});

app.post('/addPolicy', async (req,res)=>{
    // add policy
    // console.log(req.body)
    try{
        var policyData=req.body.newFullPolicy;

        var resultDoc = await mammoth.convertToHtml({path: './documents/policyDoc.docx'});
        var text = resultDoc.value;
        // console.log(postData)
        policyData['policyMainContentByHr']=text;

        // var resultPpt = await mammoth.convertToHtml({path: './documents/policyPpt.pdf'});
        // var textPpt = resultPpt.value;
        // console.log(resultPpt)
        // policyData['policyQuickContentByHr']=textPpt;

        // generateHtml('C:\Users\mohit\Downloads\policyPpt.pptx', function(err, result) {
        //     console.log("ttt")
        //     policyData['policyQuickContentByHr']=result;
        //     console.log(typeof result);
        //   });

        //   console.log("ttt2")
        // console.log(policyData)
        const result= await pModel.create(policyData);
        // console.log(result)
        res.send( {users:result,status:'200'} );
   }catch (error) {
        // console.log(error);
        res.send({status:'404'});

   }

})

async function createNotificationAdmins(data,email){

    const allUsers=await uModel.find({});
    allUsers.forEach( async (usr)=>{

         if(usr.isAdmin){
        const notificationData={
            postedBy:data.ticketByHr,
            postTime: data.postPolicyOnTime,
            postTextContentByHrNotification: data.commentContent,
            postId:data.ticketPolicyId,
            postUserEmail:usr.emailAddress 
        }
    
        const notificationResult= await nModel.create(notificationData);
       }

    })
    

}

async function createNotificationAdminsFromChild(data,email){

    const allUsers=await uModel.find({});
    allUsers.forEach( async (usr)=>{

         if(usr.isAdmin){
        const notificationData={
            postedBy:data.ticketByHr,
            postTime: data.postPolicyOnTime,
            postTextContentByHrNotification: data.commentContent,
            postId:data.policyId,
            postUserEmail:usr.emailAddress 
        }
    
        const notificationResult= await nModel.create(notificationData);
       }

    })
    

}



async function createNotificationAdminsToUser(data,email){

     
        const notificationData={
            postedBy:data.ticketByHr,
            postTime: data.postPolicyOnTime,
            postTextContentByHrNotification: data.commentContent,
            postId:data.policyId,
            postUserEmail:email 
        }
    
        const notificationResult= await nModel.create(notificationData);
       

     
    

}





app.post('/addParentTicket', async (req,res)=>{
    // add policy
    // console.log(req.body)
    try{
        var policyData=req.body.newParentTicket;
        createNotificationAdmins(policyData,policyData.ticketPolicyAdderEmail)
        const result= await pTModel.create(policyData);
        // console.log(result)
        res.send( {tickets:result,status:'200'} );
   }catch (error) {
        console.log(error);
        res.send({status:'404'});

   }

})


app.post('/addChildTicket', async (req,res)=>{
    // add policy
    // console.log(req.body)
    try{
        var childData=req.body.newChildTicket;
        if(childData.isCommentByAdmin===true){
            createNotificationAdminsToUser(childData,childData.ticketAdder)
        }else{
            createNotificationAdminsFromChild(childData,childData.ticketAdder)
        } 

        const result= await cTModel.create(childData);
        // console.log(childData)
        res.send( {tickets:result,status:'200'} );
   }catch (error) {
        console.log(error);
        res.send({status:'404'});

   }

})


 



function sortbychnk(a,b){
    return a.n<b.n;
}



app.get('/images/:filename1', async (req, res) => {
        try {


            // const file = await gfs.files.findOne({ filename: req.params.filename1 });
            // console.log(file);
            // const readStream = gridfsBucket.createReadStream(file._id);
            // console.log(readStream);
            // readStream.pipe(res);

        //  const readStream = gridfsBucket.openDownloadStream(file._id); 
        //    readStream.pipe(res);


         
    //    console.log(req.params.filename1);


        //  const fileName=req.params.filename1;
        //  const data1= await iModel.findOne({filename:fileName});
        //    console.log( typeof data1._id);
 
        //  const data2= await iModelC.find({ files_id : data1._id });
        //  console.log(data2); 
        // console.log("image api called")

        // const imagestring="data:image/jpg;base64,"+data2.data;
        // const image=JSON.stringify('<img src={imagestring}  />')
        //    data2.sort(sortbychnk)
        //   console.log(data2.length,fileName);
            
       
        //  res.send( {datafl:data2  ,status:'ok' } );
        //  console.log(image)


        const file = await gfs.files.findOne({ filename: req.params.filename1 });
        const readStream = gridfsBucket.openDownloadStream( file._id); 
        readStream.pipe(res);
 
        } catch (error) {
            console.log(error);
            res.send("not found-"+req.params.filename1);
        }
   
    });

     
    
app.get('/video/:filename1', async (req, res) => {
    try {
        


        const file = await gfs.files.findOne({ filename: req.params.filename1 });
        // console.log(file);
        // const readStream =  gfs.createReadStream( file.filename);
        // console.log(readStream);
        // readStream.pipe(res);

     const readStream = gridfsBucket.openDownloadStream( file._id); 
       readStream.pipe(res);


     
//    console.log(req.params.filename1);


    //  const fileName=req.params.filename1;
    //  const data1= await iModel.findOne({filename:fileName});
    //    console.log( typeof data1._id);

    //  const data2= await iModelC.find({ files_id : data1._id });
    //  console.log(data2); 
    // console.log("image api called")

    // const imagestring="data:image/jpg;base64,"+data2.data;
    // const image=JSON.stringify('<img src={imagestring}  />')
    //    data2.sort(sortbychnk)
    //   console.log(data2.length,fileName);
        
   
    //  res.send( {datafl:data2  ,status:'ok' } );
    //  console.log(image)
 


    } catch (error) {
        console.log(error);
        res.send("not found-"+req.params.filename1);
    }

});


//   for document
  
app.get('/doc/:filename1', async (req, res) => {
    try {
        


        const file = await gfs.files.findOne({ filename: req.params.filename1 });
        // console.log(file);
        // const readStream =  gfs.createReadStream( file.filename);
        // console.log(readStream);
        // readStream.pipe(res);

     const readStream = gridfsBucket.openDownloadStream( file._id); 
       readStream.pipe(res);


     
//    console.log(req.params.filename1);


    //  const fileName=req.params.filename1;
    //  const data1= await iModel.findOne({filename:fileName});
    //    console.log( typeof data1._id);

    //  const data2= await iModelC.find({ files_id : data1._id });
    //  console.log(data2); 
    // console.log("image api called")

    // const imagestring="data:image/jpg;base64,"+data2.data;
    // const image=JSON.stringify('<img src={imagestring}  />')
    //    data2.sort(sortbychnk)
    //   console.log(data2.length,fileName);
        
   
    //  res.send( {datafl:data2  ,status:'ok' } );
    //  console.log(image)
 


    } catch (error) {
        console.log(error);
        res.send("not found-"+req.params.filename1);
    }

});


//   pin a post 
 
app.post('/pinpost', async (req,res)=>{
    // add user
    try{
        const allPosts=await pModel.updateOne({
            _id:req.body.id
        },
          {
            $set:{
                isPinned:true
            }
          }
        
        );



    res.send( {status:'200'} );
   }catch (error) {
    // console.log(error);
    res.send({status:'404'});

   }

})
//  unpin a post

app.post('/unpinpost', async (req,res)=>{
    // add user
    try{
    const allPosts=await pModel.updateOne({
        _id:req.body.id
    },
      {
        $set:{
            isPinned:false
        }
      }
    
    );



    res.send( {status:'200'} );
   }catch (error) {
    // console.log(error);
    res.send({status:'404'});

   }

})


// all notifications
app.get('/notifications', async (req,res)=>{
    // add user
    try{
    const allNotifications=await nModel.find({});
    res.send( {posts:allNotifications,status:'200'} );
   }catch (error) {
    // console.log(error);
    res.send({status:'404'});

   }

})

 
app.post('/add/user', async (req,res)=>{
    // add user
    try{ 

        const userData=req.body.newFullUser;
        // console.log(userData)
        const result= await uModel.create(userData);

        res.send( {status:'200'} );
       }catch (error) {
        // console.log(error);
        res.send({status:'404'});
    
       }

})

app.get('/users', async (req,res)=>{
    // add user
    // console.log(req.body)
    try{
        const allUsers=await uModel.find({});
        res.send( {users:allUsers,status:'200'} );
   }catch (error) {
        // console.log(error);
        res.send({status:'404'});

   }

})

// mark all notification as read
app.post('/markallread', async (req,res)=>{
    // mar read
    
    try{ 

        // console.log(req.body.reqEmail)
        const allUser=await uModel.updateOne({
            emailAddress:req.body.reqEmail
        },
          {
            $set:{
                lastNotificationViewed:+new Date((+new Date() + 7*24*60*60*1000))
            }
          }
        
        );
        // console.log(allUser)
        res.send( {status:'200'} );
       }catch (error) {
        // console.log(error);
        res.send({status:'404'});
    
       }

})


app.get('/searchedpolicies/:query', async (req,res)=>{
    // add user
    try{
        const qry=req.params.query;
        // console.log(qry)
    const allPosts=await pModel.find({ policyMainContentByHr: { $regex: qry  } });
    res.send( {posts:allPosts,status:'200'} );
   }catch (error) {
    // console.log(error);
    res.send({status:'404'});

   }

})

app.get('/policyWithId/:pyId', async (req,res)=>{
    // add user
    try{
        const pId=req.params.pyId;
        // console.log(qry)
    const allPosts=await pModel.findOne({ _id:pId });
    res.send( {posts:allPosts,status:'200'} );
   }catch (error) {
    // console.log(error);
    res.send({status:'404'});

   }

})


/// get all parent comments
app.get('/parentComments/:id', async (req,res)=>{
    // add user
    // console.log(req.body)
    try{
        const Id=req.params.id;
        // console.log(Id)
        const parentComments=await pTModel.find({ ticketPolicyId:Id});

        res.send( {pComments:parentComments,status:'200'} );
   }catch (error) {
        // console.log(error);
        res.send({status:'404'});

   }

})

// get all child comments
app.get('/childComments/:id', async (req,res)=>{
    // add user
    // console.log(req.body)
    try{
        const Id=req.params.id;
        // console.log(Id)
        const childComments=await cTModel.find({ parentTicketId:Id});
        res.send( {cComments:childComments,status:'200'} );
   }catch (error) {
        // console.log(error);
        res.send({status:'404'});

   }

})