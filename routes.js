const express = require("express");
app = express();
const jwt = require("jsonwebtoken");
const mysqlConnection = require('./connection');
const path = require('path');

const router = express.Router();

router.get('/register', (req, res) => {
    res.render(__dirname + '/public/register.ejs',{txt:''});
})

router.post('/register',(req,res)=>{
    var data = {
        userName: req.body.username,
        email: req.body.email.toLowerCase(),
        password: req.body.password
    }
    var sqlQuery = "insert into users set ?";
    mysqlConnection.query(sqlQuery, data, (err) => {
        if (!err) {
            res.redirect('/login');
        } else {
            res.render(__dirname + '/public/register.ejs',{txt:'Email Already Exist!'});
        }
    });
});

router.get('/login', (req, res) => {
    res.render(__dirname + '/public/login.ejs',{txt:''});
})

router.post("/login",(req,res)=>{
    res.clearCookie('token');
    const user = {
        email : req.body.email,
        password : req.body.password
    }
    mysqlConnection.query("select * from users where email='" + user.email + "'", (err, rows, fields) => {
        if(err){
            res.render(__dirname+"/public/login.ejs",{txt:'User Not Found'});
        }else if(rows.length==0){
            res.render(__dirname+"/public/login.ejs",{txt:'User Not Found'});
        }
        else if (rows[0].email == user.email.toLowerCase() && rows[0].password == user.password) 
        {
            user.userId=rows[0].userId;
            user.username=rows[0].userName;
            jwt.sign({user:user},"secretKey",(err,token)=>{
                res.setHeader('Set-Cookie', [`token=${token}`]);
                res.redirect(`/dashboard`);
            });
        }else{
            res.render(__dirname+"/public/login.ejs",{txt:'Incorrect Password!'});
        }
    });
});

router.post('/logout',(req,res)=>{
    res.clearCookie('token');
    res.redirect('/login');
});

router.get('/dashboard',verifyToken, (req, res) => {
    jwt.verify(req.cookies.token,'secretKey',(err,data)=>{
        if(err){
            res.redirect('/login');
        }else{ 
            let sql = `SELECT * FROM items`;
            mysqlConnection.query(sql, (err, rows) => {
                if (err) throw err;
                res.render(__dirname + '/public/all_items_dashboard.ejs', {
                    title: 'My List',
                    items: rows,
                    userId: req.params.userId,
                    userName: data.user.username
                });
            });          
        }
    });
});

router.get('/myitems',verifyToken, (req, res) => {
    jwt.verify(req.cookies.token,'secretKey',(err,data)=>{
        if(err){
            res.redirect('/login');
        }else
        {
            let sql = `SELECT * FROM users where email='${data.user.email}'`;
            mysqlConnection.query(sql, (err, rows) => {
                if (err) 
                    { throw err;}
                mysqlConnection.query(`select * from items where userId = ${rows[0].userId}`,(error,items)=>{
                    if (err) throw err;
                    res.render(__dirname + '/public/my_items.ejs', {
                    title: 'My List',
                    items: items,
                    userName: data.user.username
                    });
                });  
            });        
        }
    });
});

router.get('/myitems/add',verifyToken, (req, res) => {
    jwt.verify(req.cookies.token,'secretKey',(err,data)=>{
        if(err){
            res.redirect('/login'); 
        }else{
            res.render(__dirname + '/public/add_item.ejs', {
                title: 'Add Item to List'
            });            
        }
    });
});

router.post('/add_item',verifyToken,(req,res)=>{
    jwt.verify(req.cookies.token,'secretKey',(err,user)=>{
        if(err){
            res.redirect('/login'); 
        }else{
            let data = {
                itemName: req.body.itemName,
                itemPrice: req.body.itemPrice,
                itemQuantity: req.body.itemQuantity,
                userId: user.user.userId
            };
            let sql = "insert into items set ?";
            mysqlConnection.query(sql, data, (err, results) => {
                if (!err) 
                    res.redirect(`/myitems`);
                else
                    res.redirect('/add_item');
            });           
        }
    });
    
});

router.get('/delete_item/:itemId',verifyToken,(req,res)=>{
    jwt.verify(req.cookies.token,'secretKey',(err,data)=>{
        if(err){
            res.redirect('/login');
        }else{
            const itemId = req.params.itemId;
            let sql = `DELETE from items where itemId = ${itemId}`;
            let query = mysqlConnection.query(sql, (err, result) => {
            if (err) throw err;
            res.redirect(`/myitems`);
    });            
        }
    });
});

router.get('/edit_item/:itemId',verifyToken,(req,res)=>{
    jwt.verify(req.cookies.token,'secretKey',(err,data)=>{
        if(err){
            res.redirect('/login');
        }else{
            const itemId = req.params.itemId;
            let sql = `Select * from items where itemId = ${itemId}`;
            let query = mysqlConnection.query(sql, (err, result) => {
                if (err) throw err;
                    res.render(__dirname + '/public/edit_item.ejs', 
                {
                    title: 'Edit Item from List',
                    userId: req.params.userId,
                    itemId: req.params.itemId,
                    item: result[0]
                });
    });          
        }
    });
});

router.post('/update/:itemId',verifyToken, (req, res) => {
    jwt.verify(req.cookies.token,'secretKey',(err,data)=>{
        if(err){
            res.redirect('/login'); 
        }else{
            const itemId = req.params.itemId;
            let sql = "update items SET itemName='" + req.body.itemName + "',  itemPrice='" + req.body.itemPrice + "',  itemQuantity='" + req.body.itemQuantity + "' where itemId =" + itemId;
            let query = mysqlConnection.query(sql, (err, results) => {
                if (err) throw err;
                res.redirect(`/myitems`);
            });            
        }
    });
});

router.get('/view/:itemId',verifyToken,(req,res)=>{
    jwt.verify(req.cookies.token,'secretKey',(err,data)=>{
        if(err){
            res.redirect('/login'); 
        }else{
            let sql1 = `SELECT * FROM items where itemId=${req.params.itemId}`;
            let query = mysqlConnection.query(sql1, (err, row) => {
                if (err) throw err;
                let sql2 = `SELECT * FROM users where userId=${row[0].userId}`;
                mysqlConnection.query(sql2, (err2, obj) => {
                    if (err) throw err2;
                        res.render(__dirname + '/public/item_details.ejs', {
                        usr:obj[0],
                        itm:row[0]
                    });
                });
            });           
        }
    });
});

router.get("/confidential",verifyToken,(req,res)=>{
    jwt.verify(req.cookies.token,'secretKey',(err,data)=>{
        if(err){
            res.redirect('/login'); 
        }else{
            res.send(data);            
        }
    });
});

function verifyToken(req,res,next){
    if(req.cookies.token!==undefined){
        req.token = req.cookies.token;
        next();
    }else{
        res.redirect('/login'); 
    }
};

module.exports  = router;