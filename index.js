const request=require('request');
const axios=require('axios');
const bodyparser=require("body-parser");
const express=require("express");
const Joi = require('joi'); 
var app=express();
app.use(express.json());
app.listen(4444,()=>console.log('Server up and running'));
app.use(function (req, res, next) {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});


app.post('/OnlineApply',async(req,res)=>{

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
          
          if(response.data.AccountNumber !==""){
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
