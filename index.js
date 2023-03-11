var express = require('express');
var socket  = require('socket.io');
var mongoose=require('mongoose');
var bodyParser = require("body-parser");
var application = express();
let usernamee='';
var server = application.listen(5004,function(){
	console.log('Your Server Is runing at http:/localhost:5000');
});
application.use(bodyParser.json());
application.use(express.static('public'))
application.use(bodyParser.urlencoded({
    extended: true
}));
application.use(express.static('public'));

var sio = socket(server);


 mongoose.connect('mongodb+srv://ilyassmandour:ilyass123@firstip.3di9lrb.mongodb.net/users?retryWrites=true&w=majority', {
     useNewUrlParser: true,
     useUnifiedTopology: true
});
var db = mongoose.connection;

db.on('error', () => console.log("Error in Connecting to Database"));
db.once('open', () => console.log("Connected to Database"));
application.post('/sign_up',(req,res)=>{
    var name=req.body.name;
    var email=req.body.email;
    var password=req.body.password;
    var phone=req.body.phone;
    var data={
        "name":name,
        "email":email,
        "password":password,
        "phone":phone

    }
    db.collection('users').insertOne(data, (err, collection) => {
        if (err) throw err;
        console.log("Record Inserted Successfully");
    });
    return res.redirect('index.html');
});

application.post("/login", async (request, response) => {
    try {
        //adding
        const username = request.body.username;
        const password = request.body.password;
        const usermail = db.collection('users').findOne({ email: username }, (err, res) => {
            if (res == null) {
                response.send("Invalid information!❌❌❌! Please create account first");
            }
            else if (err) throw err;

            if (res.password === password) {
                usernamee=res.name;
                return response.redirect('chat.html');
               
                
            }
            else {
                response.send("Invalid Password!❌❌❌");
            }
            

        }); 
       
    }catch(error){
        console.log('invalid infomration');
    }
}
);

let noms = [];      
sio.on('connection',function(visitor){

    db.collection('users').findOne({  name: usernamee }, (err, res) => {                
    if(res){
        visitor.emit('currentUser', res.name);
        visitor.broadcast.emit('new_lo',res.name);
        noms.push(res.name);
        visitor.on('message',function(data){
        sio.sockets.emit('new_msg',{
            user:res.name,
            message:data.message,
            });
    });
    visitor.on('bo',function(data){
        visitor.broadcast.emit('new_bo',res.name);
    });
    
    visitor.on('disconnect',function(){
        let index = noms.indexOf(res.name);
        if (index !== -1) {
            noms.splice(index, 1);
        }
       visitor.broadcast.emit('disco',res.name);
   });
sio.emit('nav', noms);}
   else{
    console.log('user not found');
   }
   
});
});
    

