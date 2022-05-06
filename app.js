import env from "dotenv"
import fetch from "node-fetch";
import web3 from "web3";
import express from "express";
import mongoose from "mongoose";
import bip39 from "bip39";
import HDKey from "hdkey";
import http from "http";
import path from 'path';

import UserModel from "./userDetail.js" //".userDetail"
const __dirname = path.resolve();

env.config();
const app = express();
const server = http.createServer(app);
const dbUrl = process.env.DB_URL
const privateKey = process.env.PRIVATEKEY
const HYPERFYRE_BASE_URL = 'http://localhost:6006'
const appId = process.env.APP_ID
const port = process.env.PORT
mongoose.connect(dbUrl)
    .then((result) => {
        console.log("connected successfully!");
    })
    .catch((err) => {
        console.log(err)
    });
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

//function to generate signature

const SignData = async (Json_data, privateKey) => {
    const Web3 = new web3();
    const signedData = await Web3.eth.accounts.sign(JSON.stringify(Json_data), privateKey)
    return signedData
}

app.get("/", async (req, res) => {
    try {
        res.sendFile("./public/login.html", { root: __dirname });
    } catch (e) {
        res.send(`Error: ${e}`);
    }
})
app.get('/home', (req, res) => {
    res.sendFile("./public/home.html", { root: __dirname })
})
app.get('/marketplace', (req, res) => {
    res.sendFile("./public/marketplace.html", { root: __dirname })
})
app.get('/profile', (req, res) => {
    res.sendFile("./public/profile.html", { root: __dirname })
})
app.post('/', async (req, res) => {
    try {
        let userDetail;
        userDetail = await UserModel.findOne({ publicKey: req.body })
        if (!userDetail) {
            userDetail = await UserModel.create({
                publicKey: req.body
            })
        }
        externalUserId = userDetail.publicKey;
        console.log(externalUserId)
        res.json(userDetail)
    } catch (e) {
        res.send(e)
    }
})

app.post('/event', async (req, res) => {
    try {
        const url = '/api/v1/app/events'
        req.body.data['appId'] = appId

        const payload = req.body
        const signature = await SignData(payload.data, privateKey)
        payload['fyresign'] = signature.signature
        payload['datahash'] = signature.messageHash         
        const externalPlatformInfo = await fetch(HYPERFYRE_BASE_URL + url, {
            headers: {
                "Content-Type": 'application/json'
            },
            method: 'POST',
            body: JSON.stringify(payload)
        })
            .then(async response => {
                const resp = await response.json()
                res.send(resp)
            })

    } catch (e) {
        console.log(`Error: ${e}`);
        res.send(e)
    }
})
app.post('/user/event', async (req, res) => {
    try {
        const url = '/api/v1/app/user/events'
        req.body.data['appId'] = appId
        const payload = req.body
        const signature = await SignData(payload.data, privateKey)
        payload['fyresign'] = signature.signature
        payload['datahash'] = signature.messageHash
        const externalPlatformInfo = await fetch(HYPERFYRE_BASE_URL + url, {
            headers: {
                "Content-Type": 'application/json'
            },
            method: 'POST',
            body: JSON.stringify(payload)
        })
            .then(async response => {
                const resp = await response.json()
                console.log(resp)
                res.send(resp)
            })

    } catch (e) {
        console.log(`Error: ${e}`);
        res.send(e.messsage)
    }
})

app.post('/token', async (req, res) => {
    try {
        const url = '/api/v1/app/user/redirection'    
        req.body.data['appId'] = appId
        const payload = req.body   
        const signature = await SignData(payload.data, privateKey)
        payload['fyresign'] = signature.signature
        payload['datahash'] = signature.messageHash       
        const accessToken = await fetch(HYPERFYRE_BASE_URL + url, {
            headers: {
                "Content-Type": 'application/json'
            },
            method: 'POST',
            body: JSON.stringify(payload)
        })
            .then(async response => {
                const resp = await response.json()
                console.log(resp)
                res.send(resp)
            })

    } catch (e) {
        console.log(`Error: ${e}`);
        res.send(e)
    }
})

app.post('/participate', async(req, res)=> {
 try{
    const {slug, token}= req.body
    const url= `/form/${slug}?token=${token}`
    const result= await fetch(HYPERFYRE_BASE_URL + url, {
        method:'GET'
    }).then(async response=>{
        const resp= await response.json()
        console.log(resp)
        res.send(resp)
    })


}catch(e){

}

})
server.listen(port, () => {
    console.log('server is running on  port', port);
})