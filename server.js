var express = require('express')
var escape = require('escape-html');
var app = express()
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(':memory:');
db.serialize(function() {
    db.run("CREATE TABLE user (id int,username TEXT,password TEXT)");
    db.run("insert into user values (1,'张三','123')");
    db.run("insert into user values (2,'李四','456')");
})
// x-frame-options
// content-security-policy
app.all("*",(req,res,next)=>{
    res.header('x-frame-options','deny');
    res.header('content-security-policy',"script-src 'self' https://cdn.bootcss.com")
    next()
})
app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.use(express.static('./public'))

//---------------------xss---------------------------------
var content = "";
app.get("/content",(req,res)=>{
    // 解决方案：
    res.send(escape(content))
    // res.send(content)
})

app.post('/setContent',(req,res)=>{
    content=req.body.content
    res.send("OK")
})

//---------------------sql---------------------------------
app.post('/login',(req,res)=>{
    var sql = `select * from user where username='${req.body.username}' and password='${req.body.password}'`
    console.log(sql)

    //解决方案
    var stmt = db.prepare(`select * from user where username=? and password=?`)
    
    db.serialize(function() {
        stmt.all([req.body.username,req.body.password],function(err,data){
        // db.all(sql,function(err,data){
            if(err)console.log(err)
            console.log(data)
            if(data.length>0)
                res.send("登录成功")
            else
                res.send("登录失败")
        })
    })
})


app.listen(4000)