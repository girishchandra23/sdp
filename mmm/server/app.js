const dotenv =require('dotenv');
const express =require('express');
const bcryptjs =require('bcryptjs');
const jwt =require('jsonwebtoken');
const cookieParser =require('cookie-parser');


const app=express();

dotenv.config({path:'./config.env'});
require('./db/conn');

const port=process.env.PORT;
//require model
const Users=require('./models/userSchema');


app.use(express.json());
app.use(express.urlencoded({extended : false}));
app.use(cookieParser());

app.get('/',(req,res)=>{
    res.send("HEllo world");
})

//registration
app.post('/register',async (req,res)=>{
    try{
        //get body or data
        const username=req.body.username;
        const email=req.body.email;
        const password=req.body.password;

        const createUser =new Users({
            username: username,
            email : email,
            password : password
        });
         //sve method is used to create user or insert user
         //but before saving or inserting , password will hash
         //because of hashing . after hash,it will save to db
        const created =await createUser.save();
        console.log(created);
        res.status(200).send("registered");
    }catch(error){
       res.status(400).send(error)
    }
})

//login user
app.post('/login',async(req,res)=>{
    try{
        const email=req.body.email;
        const password =req.body.password;

        //find user if exists
        const user=await Users.findOne({email: email});
        if(user){
            const isMatch= await bcryptjs.compare(password,user.password);
            if(isMatch)
            {
                const token=await user.generateToken();
                res.cookie("jwt",token,{
                    expire : new Date(Date.now() + 86400000),
                    httpOnly:true
                })
                res.status(200).send("LoggedIn")
            }else{
                res.status(400).send("INvalid Credentials");
            }
    
        }else{
            res.status(400).send("INvalid Credentials");
        }

    }catch(error){
       res.status(400).send(error);
    }
})
app.get('/logout',(req,res)=>{
    res.clearCokkie("jwt",{path : '/'})
    res.status(200).send("User logged out")
})

app.listen(port,()=>{
    console.log("server is listening")
})

