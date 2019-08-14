const express= require('express');
const exphbs= require('express-handlebars');
const paypal= require('paypal-rest-sdk');
const path= require('path');

paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'AaRi-INU7P7R3kVAr_H9gu5FTfvxBTQCjfwTFE_mt0lr-VSSK42m8B2T9vBorT-ElCq0t1P_4GhBFxaI',
  'client_secret': 'EDdhoYqNcY8CKxk3N9ZprXImettwKrMlRJ2fBLPJWuGengBB3ENaos0dOIPHpGJy4J7f2KDuoXoBAzPi'
});

const app= express();
const port= process.env.PORT || 8000;


//View engine-----defaultLayout:home
app.engine('.hbs', exphbs({extname: '.hbs',defaultLayout:'layout'}));
app.set('view engine', '.hbs');



app.get('/',(req,res)=> {
    res.render('index');
})


app.post('/pay',(req,res)=> {
    
    const create_payment_json = {
    "intent": "sale",
    "payer": {
        "payment_method": "paypal"
    },
    "redirect_urls": {
        "return_url": "http://localhost:8000/success",
        "cancel_url": "http://localhost:8000/cancel"
    },
    "transactions": [{
        "amount": {
            "currency": "INR",
            "total": "200.00"
        },
        "description": "This is the payment description."
    }]
};
    

   paypal.payment.create(create_payment_json, function (error, payment) {
    if(error){
        throw error;
    }
    else{
        for(let i=0; i< payment.links.length; i++){
            if(payment.links[i].rel==='approval_url'){
                res.redirect(payment.links[i].href);
            }
        }
    }
});
      
})


app.get('/success',(req,res)=> {
    
    const payerId= req.query.PayerID;
    const paymentId= req.query.paymentId;
    
    const execute_payment_json = {
        "payer_id": payerId,
        "transactions": [{
            "amount": {
                "currency": "INR",
                "total": "200.00"
            }
        }]
    };
    
    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            console.log(JSON.stringify(payment));
            res.render('success');
//            res.sendFile(path.join(__dirname + '/index.html'));
        }
    });

})


app.get('/cancel',(req,res)=> {
    res.render('cancel');
})






app.listen(port,()=> {
    console.log(`Started on port ${port}`);
})
