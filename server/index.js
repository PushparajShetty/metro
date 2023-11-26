import express from "express";
import cors from 'cors'
import { adminRouter } from "./login.js";
const app=express()
app.use(cors({
    origin:["http://localhost:3000"],
    methods:['GET','POST',"PUT","DELETE"],
    credentials:true
}))
app.use(express.json())


app.use('/auth',adminRouter)
app.get("/",function(req,res){
    res.send("how are you")
})

app.listen(4000,()=>{
    console.log("running")
})