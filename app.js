import env from "dotenv"
import fetch from "node-fetch";
import web3 from "web3";
import express from "express";
import mongoose from "mongoose";
import http from "http";
import path from 'path';
import UserModel from "./userDetail.js"
const __dirname = path.resolve();

env.config();
const app = express();
const server = http.createServer(app);
const dbUrl = process.env.DB_URL
const privateKey = process.env.PRIVATEKEY
const base_url = process.env.HYPERFYRE_BASE_URL
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

const SignData = async(Json_data, privateKey) => {
    const Web3 = new web3();
    const signedData = await Web3.eth.accounts.sign(JSON.stringify(Json_data), privateKey)
    return signedData
}
app.get("/", async(req, res) => {
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
app.post('/', async(req, res) => {
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

app.post('/event', async(req, res) => {
    try {
        const path = '/api/v1/app/events'
        req.body.message['appId'] = appId
        const payload = req.body

        const signature = await SignData(payload.message, privateKey)
        payload['fyresign'] = signature.signature
        payload['messageHash'] = signature.messageHash

        console.log({
            base_url,
            path,
            payload
        })
        const response = await fetch(base_url + path, {

            headers: {
                "Content-Type": 'application/json'
            },
            method: 'POST',
            body: JSON.stringify(payload)
        })

        console.log(response.status)
        const json = await response.json()
        console.log(json)
        res.send(json)

    } catch (e) {
        console.log(`Error: ${e}`);
        res.send(e)
    }
})
app.post('/user/event', async(req, res) => {
    try {
        const url = '/api/v1/app/user/events'
        req.body.message['appId'] = appId
        const payload = req.body
        const signature = await SignData(payload.message, privateKey)
        payload['fyresign'] = signature.signature
        payload['messageHash'] = signature.messageHash

        console.log({
            payload,
            base_url,
            url
        });
        const resp = await fetch(base_url + url, {
            headers: {
                "Content-Type": 'application/json'
            },
            method: 'POST',
            body: JSON.stringify(payload)
        })
        console.log(resp)
        const json = await resp.json()
        console.log(json)
        res.send(json);

    } catch (e) {
        console.log(`Error: ${e}`);
        res.send(e.messsage)
    }
})

app.post('/token', async(req, res) => {
    try {

        const url = '/api/v1/app/user/redirection'
        req.body.message['appId'] = appId
        const payload = req.body
        const signature = await SignData(payload.message, privateKey)
        payload['fyresign'] = signature.signature
        payload['messageHash'] = signature.messageHash

        const response = await fetch(base_url + url, {
            headers: {
                "Content-Type": 'application/json'
            },
            method: 'POST',
            body: JSON.stringify(payload)
        })
        console.log(response.status)
        const json = await response.json()
        console.log(json)
        res.send(json)


    } catch (e) {
        console.log(`Error: ${e}`);
        res.send(e)
    }
})

server.listen(port, () => {
    console.log('server is running on  port http://localhost:' + port);
})