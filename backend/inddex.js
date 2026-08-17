import express from "express"

const app=express()
app.use(express.json({limit:"30mb",extended:true}));
app.use(express.urlencoded ({limit:"30mb",extended=true}) );

app.get("/",(res,req)=>{
    res.send("stackoverflow clone is running perfect");
})