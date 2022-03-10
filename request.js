const request=require('request');
const axios=require('axios');
const bodyparser=require("body-parser");
const express=require("express");
const Joi = require('joi'); 
//app.use(express.json());
var app=express();
app.use(express.json());
app.listen(4444,()=>console.log('Server up and running'));




app.post('/OnlineApply',async(req,res)=>{
console.log(req);
const data=
    {
        "FirstName": req.body.FirstName,
        "MiddleName": req.body.MiddleName,
        "LastName": req.body.LastName,
        "Email": req.body.Email,
        "DateOfBirth": req.body.DateOfBirth,
        "Gender": req.body.Gender,
        "Address": req.body.Address,
        "PhoneNumber": req.body.PhoneNumber,
        "ProductCode2": "100"
      }
const url='http://52.168.85.231/BankOneWebAPI/api/CustomerAndAccountCreation/CreateCustomerAndAccount/1?institutionCode=100605';
      axios.post(url, data)
      .then((response) => {
          
          if(response.data.AccountNumber===""){
            let myResponse={
                responseCode:"00",
                responseMessage:"Successful",
                AccountNumber:response.data.AccountNumber,
                CustomerID:response.data.CustomerID,
                FullName:response.data.FullName
                
            }
            res.send(JSON.stringify(myResponse));
          }else{
            let myResponse={
                responseCode:"69",
                responseMessage:response.data.ErrorInfo,
                
                

            }
            res.send(JSON.stringify(myResponse));
          }

         
        console.log(response);
      }, (error) => {
        console.log(error);
        res.send(JSON.stringify(error));
      });
   
})
