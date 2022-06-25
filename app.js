const express = require('express')
const request = require('request')
const mongoose = require('mongoose')
const bodyparser = require('body-parser')
const path = require('path')
const { STATUS_CODES } = require('http')

// mongoose.connect("mongodb://localhost:27017/bankDB", { useNewUrlParser: true });
mongoose.connect("mongodb+srv://NASHU153045:NASHU153045@cluster0.xyv0c.mongodb.net/bankDB",{useNewUrlParser:true});
// mongoose.connect(
//     "mongodb+srv://NASHU153045:NASHU153045@cluster0.xyv0c.mongodb.net/bankDB",
//     {
//         useNewUrlParser: true
//     }
// );



const app = express()
app.set("view engine", 'ejs');
app.use(bodyparser.urlencoded({ extended: true }))
app.use(express.json())
app.use(express.static('public'))

app.get('/', (req, res) => {
    res.render("index")
})
app.get("/customer", (req, res) => {
    res.render("customer")
})
app.get("/customerDetail", (req, res) => {
    res.render("customerDetail")
})

const customerSchema = {
    name: String,
    emailId: String,
    account: Number,
    current_balance: Number
}
const transferSchema = {
    sender: String,
    recevied_to: String,
    account_no: Number,
    amount: Number
}

const customer = mongoose.model("customer", customerSchema)
const transactionDetail = mongoose.model("transactionDetail", transferSchema)
// new user registration 
app.post("/customerDetail", (req, res) => {
    try {
        const newUser = new customer({
            name: req.body.name,
            emailId: req.body.email,
            account: req.body.account,
            current_balance: req.body.amount
        })
        newUser.save((err) => {
            if (!err) {
                console.log("Inserted successfully")
            }
            else {
                console.log(err)
            }
        })
    } catch (err) {
        res.status(404).send("Error found!!!")
    }

});

// display customer table 
app.get("/customerTable", (req, res) => {
    try{
        customer.find({}, function (err, allDetails) {
            if (err) {
                console.log(err);
            } else {
                res.render("customerTable", { details: allDetails })
            }
        })
    }catch(err)
    {
        res.status(404).send("Error found!!!")
    }
    
})

// tranfer  money to customer and update the mpney
app.post("/customer", async (req, res) => {
    try {
        const account_h = req.body.acch_account
        const account_name = req.body.acch_name
        const account_exit = await customer.findOne({ account: account_h });
        if (account_exit.name === account_name) {

            const new_amount = account_exit.current_balance + Number(req.body.acch_amount)
            const update_amount = await customer.findOneAndUpdate({ account: req.body.acch_account }, { current_balance: new_amount }, { new: true })

            const new_transaction = new transactionDetail({
                sender: req.body.send_name,
                recevied_to: req.body.acch_name,
                account_no: req.body.acch_account,
                amount: req.body.acch_amount

            })
            new_transaction.save((err) => {
                if (!err) {
                    console.log("saved successfully")
                }
                else {
                    res.status(404).send("Error something went erong")
                }
            })
        }
    } catch (err) {
        res.status(404).send("Error found")
    }

});
// display tranaction details 
app.get("/transaction", (req, res) => {
    try{
        transactionDetail.find({}, function (err, allDetails) {
            if (err) {
                console.log(err);
            } else {
                res.render("transaction", { details: allDetails })
            }
        })
    }catch(err)
    {
        res.status(404).send("Error found") 
    }
    
})
// display the individual transaction of the customer
app.get("/singletransaction", (req, res) => {
    res.render("singletransaction")
})

app.post("/singletransaction", (req, res) => {
    try {

        const account_conf = req.body.acch_account_conf
        transactionDetail.find({ account_no: account_conf }, (err, allDetails_conf) => {
            if (err) {
                alert("Invalid credentials please try again !!!")
            }
            else {
                res.render("singletrans", { details_conf: allDetails_conf })
            }
        });

    } catch (err) {
        res.status(404).send("Error found !!!")
    }

})

app.listen(process.env.PORT || 3000, () => {
    console.log("Server is running at 3000")
})