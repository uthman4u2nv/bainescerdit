const request=require('request');
const axios=require('axios');
const bodyparser=require("body-parser");
const express=require("express");
const Joi = require('joi'); 
var app=express();
app.use(express.json());
const port = process.env.PORT || 8080;
//app.listen(port,()=>console.log('Server up and running'));
app.listen(port, () => {
  console.log('Express server listening on port', port)
});
app.use(function (req, res, next) {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');

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

app.get('/',(req,res)=>{
  res.send("Welcome to Baines Account Opening API");
})

function ReturnDateTime(){
  let date_ob = new Date();

// current date
// adjust 0 before single digit date
let date = ("0" + date_ob.getDate()).slice(-2);

// current month
let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

// current year
let year = date_ob.getFullYear();

// current hours
let hours = date_ob.getHours();

// current minutes
let minutes = date_ob.getMinutes();

// current seconds
let seconds = date_ob.getSeconds();

// prints date in YYYY-MM-DD format
console.log(year + "-" + month + "-" + date);

// prints date & time in YYYY-MM-DD HH:MM:SS format
return year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;

// prints time in HH:MM format
//console.log(hours + ":" + minutes);
}

app.post('/OpenFixedDepositAccount',async(req,res)=>{
console.log(req);
  const data=
  {
    "IsDiscountDeposit": true,
    "Amount": req.body.Amount,
    "InterestRate": req.body.InterestRate,
    "Tenure": req.body.tenure,
    "CustomerID": req.body.CustomerID,
    "ProductCode": req.body.ProductCode,
    "LiquidationAccount": req.body.LiquidationAccount,
    "InterestAccrualCommenceDate": ReturnDateTime()
  }
const url='http://52.168.85.231/BankOneWebAPI/api/FixedDeposit/CreateFixedDepositAcct2/2?authtoken=60631a02-9cfe-40e1-949b-7b080d827955';
axios.post(url, data)
      .then((response) => {
          
          if(response.data.IsSuccessful){
            let myResponse={
                responseCode:"00",
                responseMessage:response.data.Message
                
            }
            res.send(JSON.stringify(myResponse));
          }else{
            let myResponse={
                responseCode:"69",
                responseMessage:response.data.Message,
                
                

            }
            res.send(JSON.stringify(myResponse));
          }

         
        console.log(response);
      }, (error) => {
        console.log(error);
        res.send(JSON.stringify(error));
      });


})

app.post('/OnlineApply',async(req,res)=>{
const data2='';
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
        "ProductCode2": req.body.ProductCode2
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
