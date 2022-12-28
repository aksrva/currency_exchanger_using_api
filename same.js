const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const hbs = require('hbs');
const https = require('https');
const body_parser = require("body-parser");
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, "public")));
app.use(body_parser.urlencoded({extended: true}));

app.get("/", (req, res) => {
    let exc =  false;
    let c;
    let selected, selectedImage;
    if(req.query.curr){
        c = req.query.curr
        exc = true;
        selected = c;
        if(fs.existsSync(`public/img/${c}.png`)){
            selectedImage = `${c}.png`;
        }else if(fs.existsSync(`public/img/${c}.webp`)){
            selectedImage = `${c}.webp`;
        }else{
            selectedImage = `INR.webp`;
        }    
    }else{
        c = "INR";
    }
   
    https.get(`https://open.er-api.com/v6/latest/${c}`, (resp) => {
        let country = [];
        let body = "";
        try{
            resp.on("data", (chunk) => {
                body += chunk;
            });
            resp.on("end", () => {
                let all_info = [];
                let currency = JSON.parse(body);     
                for(let i in currency.rates){
                    let y = {};
                    y.currency_code = i;
                    y.rates = currency.rates[i];
                    if(fs.existsSync(`public/img/${i}.png`)){
                        y.image = `${i}.png`;
                    }else if(fs.existsSync(`public/img/${i}.webp`)){
                        y.image = `${i}.webp`;
                    }else{
                        y.image = `INR.webp`;
                    }
                    all_info.push(y);                    
                }             
                res.render("new", {homepage: true, exchange: exc, country: all_info, selected: selected, selectedImage: selectedImage});
            });
        }catch(err) {
            console.log(err);
        }
    }).on("error", (err) => {
        console.log(err.message);
    })
});
app.get("/curr", (req, res) => {
    let curr = req.query.currency_name;
    res.redirect("/?curr=" + curr);
})

app.listen(3010, () => {
    console.log("Server has been started at port 3010...");
})