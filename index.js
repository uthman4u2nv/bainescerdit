const {Prohairesis}=require('prohairesis');
const request=require('request');
const axios=require('axios');
const bodyparser=require("body-parser");
const express=require("express");
const Joi = require('joi'); 
//var conn=require('./connection');
var app=express();
app.use(express.json());
app.set("NibssCode","100605");
app.set("Token","60631a02-9cfe-40e1-949b-7b080d827955");
app.set("GLCode","1530");
const port = process.env.PORT || 8080;
//app.listen(port,()=>console.log('Server up and running'));

const env=require('./connection');
const database=new Prohairesis(env.CLEARDB_DATABASE_URL);
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

app.post('/TransHistory',async(req,res)=>{
  let accountNo=req.body.accountNo;
  database.query(
    `SELECT * FROM transactions WHERE accountNo='${accountNo}' ORDER BY transDate DESC`
  ).then((result)=>{
    console.log(res);
    res.send(result);
  }).catch((err)=>{
    console.log("Error fetching records:"+err)
  }).finally(()=>{
    //database.close();
  })
})

app.post('/FundAccount',async(req,res)=>{
  let insertId=0;
  const NibssCode=app.get('NibssCode');
  const Token=app.get('Token');
  const GLCode=app.get('GLCode');
  console.log("NIBSSCode:"+NibssCode+" Token:"+Token+" GLCode:"+GLCode+"Retrieval reference:"+req.body.RetrievalReference);
  const data={
    "RetrievalReference":req.body.RetrievalReference,
    "AccountNumber":req.body.AccountNumber,
    "NibssCode":NibssCode,
    "Amount":req.body.Amount,
    "Narration":req.body.Narration,
    "Token":Token,
    "GLCode":GLCode
  }
  //log into database
  let currentdatetime=GetCurrentDateTime();
  let ref=req.body.RetrievalReference;
  let acctNo=req.body.AccountNumber;
  let amt=req.body.Amount/100;
  let nar=req.body.Narration
  database.query(
    `INSERT INTO transactions(transDate,accountNo,transRef,amount,narration,transRequestData) VALUES('${currentdatetime}','${acctNo}','${ref}','${amt}','${nar}','${data}')`
  ).then((res)=>{
    console.log(res);
    insertId=res.insertId
  }).catch((err)=>{
    console.log("Error inserting:"+err)
  }).finally(()=>{
    //database.close();
  })
  /*var query="INSERT INTO transactions(transDate,accountNo,transRef,amount,narration,transRequestData) VALUES(?,?,?,?,?,?)";

conn.query(query,[currentdatetime,req.body.AccountNumber,"5885",req.body.Amount,req.body.Narration,data],(err,result)=>{
  if(!err){
    insertId=result.insertId;
    console.log("Insert ID:"+insertId);
  }else{
    console.log("Error at insertion:"+err.sqlMessage);
  }
})*/

  const url="http://52.168.85.231/thirdpartyapiservice/apiservice/CoreTransactions/Credit";
  axios.post(url, data)
      .then((response) => {
        if(response.data.IsSuccessful){
          //update the transaction
          /*var qry="UPDATE transactions SET transResp=?,responseCode=? WHERE transID=?";
          conn.query(qry,[response,insertId],(er,rows)=>{
            if(er){
              console.log(er.sqlMessage);
            }
          })*/
          /*database.query(
            `UPDATE transactions SET transResp='${response}',responseCode='${response.data.ResponseCode}' WHERE transID='${insertId}'`
          ).then((res)=>{
            console.log(res);
          }).catch((err)=>{
            console.log("Error updating:"+err)
          }).finally(()=>{
            database.close();
          })*/

          let resp={
            responseCode:"00",
            responseMessage:response.data.ResponseMessage
          }
          res.send(resp)
        }else{
          let resp={
            responseCode:"69",
            responseMessage:response.data.ResponseMessage
          }
          res.send(resp)
        }
      },(error)=>{
        let resp={
          responseCode:"99",
          responseMessage:error.message
        }
        res.send(resp)
      });
})

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

app.post('/CustomerDetails',async(req,res)=>{
  const url='http://52.168.85.231/BankOneWebAPI/api/Account/GetAccountByAccountNumber/2?authtoken=60631a02-9cfe-40e1-949b-7b080d827955&accountNumber='+req.body.accountNo+'&computewithdrawableBalance=true';
  const data2='';
  axios.get(url, data2)
  .then((response) => {
          console.log("My response:"+response);
    if(response.data.customerID !==""){
      let myResponse={
          responseCode:"00",
          responseMessage:"Successful",
          AvailableBalance:response.data.AvailableBalance,
          LedgerBalance:response.data.LedgerBalance,
          WithdrawableBalance:response.data.WithdrawableBalance,
          AccountType:response.data.AccountType,
          
          
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
},(error) => {
  console.log(error);
  let myResponse={
    responseCode:"99",
    responseMessage:req.body.accountNo+ " is not a valid account number"
   // responseMessage:data.Message,       
    

}
  res.send(JSON.stringify(myResponse));
});
})

app.post('/GetCustomerByAccountNo',async(req,res)=>{
  const url='http://52.168.85.231/BankOneWebAPI/api/Customer/GetByAccountNumber/2?authtoken=60631a02-9cfe-40e1-949b-7b080d827955&accountNumber='+req.body.accountNo;
  const data2='';
  axios.get(url, data2)
  .then((response) => {
          console.log("My response:"+response);
    if(response.data.customerID !==""){
      let myResponse={
          responseCode:"00",
          responseMessage:"Successful",
          CustomerID:response.data.customerID,
          Name:response.data.LastName+" "+response.data.OtherNames,
          Email:response.data.Email,
          Phone:response.data.PhoneNumber,
          
          
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
  let myResponse={
    responseCode:"99",
    responseMessage:req.body.accountNo+ " is not a valid account number"
   // responseMessage:data.Message,       
    

}
  res.send(JSON.stringify(myResponse));
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

const GetCurrentDateTime= function (){
    
  let date_ob = new Date();
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
      let regDate=year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;
      
      return regDate;
}
