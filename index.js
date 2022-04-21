const {Prohairesis}=require('prohairesis');
const request=require('request');
const https = require('https')
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
const utils = require('nodemon/lib/utils');
const database=new Prohairesis(env.CLEARDB_DATABASE_URL);

const cors = require('cors');
app.use(cors({
    origin: '*'
}));

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
app.use(function(req, res, next){
  res.setTimeout(120000, function(){
     console.log('Request has timed out.');
        res.send(408);
     });

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

app.post('/BVNValidation',async(req,res)=>{
  const url="https://staging.mybankone.com/thirdpartyapiservice/apiservice/Account/BVN/GetBVNDetails";
  const data={
    "token":app.get('Token'),
    "BVN":req.body.BVN
  }
  console.log("Data:"+JSON.stringify(data));
  axios.post(url, data)
  .then((response) => {
    if(response.data.ResponseMessage){
      const resp={
        "phoneNumber":response.data.bvnDetails.phoneNumber,
        "FirstName":response.data.bvnDetails.FirstName,
        "LastName":response.data.bvnDetails.LastName,
        "OtherNames":response.data.bvnDetails.OtherNames,
        "DOB":response.data.bvnDetails.DOB
      }
      res.send(resp);
    }else{
      const resp={
        "phoneNumber":"",
        "FirstName":"",
        "LastName":"",
        "OtherNames":"",
        "DOB":""
      }
        res.send(resp);
    }
  },(error)=>{
    let resp={
      responseCode:"99",
      responseMessage:error.message
    }
    res.send(resp)
  });
  
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

//load all customers cards
app.get('/loadcards/:email',async(req,res)=>{
  let email=req.params.email;
  database.query(
    `SELECT * FROM cards WHERE email='${email}' GROUP BY last4 ORDER BY cardCreated DESC`
  ).then((result)=>{
    console.log(res);
    res.send(result);
  }).catch((err)=>{
    console.log("Error fetching records:"+err)
  }).finally(()=>{
    //database.close();
  })
})

//verify transaction and store authorization code for monthly deductions
app.get('/verifyPaystackTrans/:ref/:accountNo',async(req,ress)=>{
  let ref=req.params.ref;
  let acctNo=req.params.ref;
  //const url='https://api.paystack.co/transaction/verify/'+ref;
  var config = {
    method: 'get',
    url: 'https://api.paystack.co/transaction/verify/'+ref,
    headers: { 
      'Authorization': 'Bearer sk_test_5a79f201933c7347065f707728af9938f02f2ee6', 
      'Cookie': 'sails.sid=s%3AcxA_eT_vMzhvdhm5sSi0rzRnFRxhYy0m.z%2BRL0NzURzfv6xkT4SoyFJTk0EFYRe8XzktIr%2FisFgI'
    }
  };
  
  axios(config)
  .then(function (response) {
    //console.log(JSON.stringify(response.data));
    //res.send(JSON.stringify(response.data.data.authorization))      
    //res.send(JSON.stringify(response.data.data))
//insert into cards table
let insertId=0;
let currentdatetime=GetCurrentDateTime();
let first_name=response.data.data.customer.first_name;
let last_name=response.data.data.customer.last_name;
let email=response.data.data.customer.email;
let authorization_code=response.data.data.authorization.authorization_code;
let bin=response.data.data.authorization.bin;
let last4=response.data.data.authorization.last4;
let exp_month=response.data.data.authorization.exp_month;
let exp_year=response.data.data.authorization.exp_year;
let card_type=response.data.data.authorization.card_type;
let bank=response.data.data.authorization.bank;
let signature=response.data.data.authorization.signature;
let account_name=response.data.data.authorization.account_name;
let country_code=response.data.data.authorization.country_code;

database.query(
  `INSERT INTO cards(loanAccountNo,cardCreated,last_name,first_name,email,authorization_code,bin,last4,exp_month,exp_year,card_type,bank,signature,account_name,country_code) VALUES('${acctNo}','${currentdatetime}','${last_name}','${first_name}','${email}','${authorization_code}','${bin}','${last4}','${exp_month}','${exp_year}','${card_type}','${bank}','${signature}','${account_name}','${country_code}')`
).then((res)=>{
  console.log(res);
  insertId=res.insertId;
  if(insertId > 0){
    let resp={
      responseCode:"00",
      responseMessage:"Card Linked Successfully"
    }
    ress.send(JSON.stringify(resp));
  }else{
    let resp={
      responseCode:"69",
      responseMessage:"Error linking card"
    }
    ress.send(JSON.stringify(resp));
  }
}).catch((err)=>{
  console.log("Error inserting:"+err)
}).finally(()=>{
  //database.close();
})

  })
  .catch(function (error) {
    console.log(error);
  });    
})
//loan details
app.get('/loandetails/:loanAccountNumber',async(req,res)=>{
  AccountNo=req.params.loanAccountNumber;
  const url='http://52.168.85.231/BankOneWebAPI/api/Loan/GetTotalPaymentsOnLoan/2?authtoken=60631a02-9cfe-40e1-949b-7b080d827955&loanAccountNumber='+AccountNo;
  const data2='';
  axios.get(url, data2)
  .then((response) => {
    if(response.data.IsSuccessful==true){
      let resp={
        LoanAccountNumber:response.data.Message.LoanAccountNumber,
        LoanAmount:response.data.Message.LoanAmount,
        TotalPaymentOnLoan:response.data.Message.TotalPaymentOnLoan,
        PrincipalPaid:response.data.Message.PrincipalPaid,
        InterestPaid:response.data.Message.InterestPaid,
        TotalOutstandingPrincipal:response.data.Message.TotalOutstandingPrincipal,
        PrincipalDueButUnpaid:response.data.Message.PrincipalDueButUnpaid,
        InterestDueButUnpaid:response.data.Message.InterestDueButUnpaid,
      }
      res.send(JSON.stringify(resp));
    }else{
      let resp={
        responseCode:"69",
        responseCode:"No Loan schedule found for this account"
      }
      res.send
    }

  },(error)=>{
    console.log(error)
    res.status(500).send();
  })
  
})


//loan schedule
app.get('/loanschedule/:loanAccountNumber',async(req,res)=>{
  AccountNo=req.params.loanAccountNumber;
  const url='http://52.168.85.231/BankOneWebAPI/api/Loan/GetLoanRepaymentSchedule/2?authtoken=60631a02-9cfe-40e1-949b-7b080d827955&loanAccountNumber='+AccountNo;
  const data2='';
  axios.get(url, data2)
  .then((response) => {
    if(response.data.Id !=""){
      res.send(JSON.stringify(response.data));
    }else{
      let resp={
        responseCode:"69",
        responseCode:"No Loan schedule found for this account"
      }
      res.send
    }

  },(error)=>{
    console.log(error)
    res.status(500).send();
  })
  
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
