const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const hbs = require('hbs');
const https = require('https');
const body_parser = require("body-parser");
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, "public")));
app.use(body_parser.urlencoded({extended: true}))
app.get("/", (req, res) => {
    https.get("https://open.er-api.com/v6/latest/INR", (resp) => {
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
                res.render("index", {homepage: true, country: all_info});
            });
        }catch(err) {
            console.log(err);
        }
    }).on("error", (err) => {
        console.log(err.message);
    })
});
// app.get("/exchange", (req, res) => {
app.post("/exchange", (req, res) => {
    // curr = req.query.currency_name;
    curr = req.body.currency_name;
    let img = "";
    if(fs.existsSync(`public/img/${curr}.webp`)){
        img = curr + ".webp";
    }else if(fs.existsSync(`public/img/${curr}.png`)){
        img = curr + ".png";
    }else{
        console.log("File Does not Exists");
    }
    https.get(`https://open.er-api.com/v6/latest/${curr}`, (resp) => {
        let body = "";
        let all_info = {};
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
                    }else if(fs.existsSync(`public/img/${i}.svg`)){
                        y.image = `${i}.svg`;
                    }else{
                        y.image = `INR.webp`;
                    }
                    all_info.push(y);                    
                }
                res.render("index", {exchange: true, dta: currency.rates, selected: curr, selectedImage: img, data: all_info})
            });
        }catch(err) {
            console.log(err);
        }
    }).on("error", (err) => {
        console.log(err.message);
    })
});
app.listen(3009, () => {
    console.log("Server has been started at port 3009...");
})