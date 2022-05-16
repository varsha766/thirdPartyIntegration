import express from "express";
import web3 from "web3";
import fetch from "node-fetch";
const port = 4000;

const app = express();
const credential = {
    appWalletAddress: "0x32ac069d865E690CF163C6b9C2e63033b1d44eB8",
    AppPrivateKey: "0x4c391814951c00a7b91a62f1802ce8747aa8fbd14466975afc1a768df809fe3e",
    AppPublicKey: "0x02d09677f1cbaf88019ce3912fe8c0afca2b88ddd5bfdf18484af1bc26698c5f86",
    RecoveryPhrase: "property inquiry neglect try dry gorilla genuine powder imitate symptom orange marble country congress until viable grape similar tunnel sleep mobile blanket notable advice",
    AppId: "627a9f5b42ad5242e2f425de",
};


const SignData = async(Json_data, privateKey) => {
    const Web3 = new web3();
    const signedData = await Web3.eth.accounts.sign(JSON.stringify(Json_data), privateKey)
    return signedData
}


const baseURl = 'http://localhost:6006'
app.get("/events", async(req, res, next) => {
    console.log('Isndie post events')
    try {
        const url = baseURl + '/ext/api/v1/app/events'
        let payload = {
            "message": {
                "appId": credential.AppId,
                "iat": Math.floor(Date.now() / 1000),
                "exp": Math.floor((Date.now() + (3600 * 24 * 1000)) / 1000),
                "metaData": {
                    "page": 1,
                    "limit": 2
                }
            },
            "fyresign": "",
            "messageHash": ""
        }

        const signature = await SignData(payload.message, credential.AppPrivateKey)
        payload['fyresign'] = signature.signature
        payload['messageHash'] = signature.messageHash

        console.log(payload)
        const resp = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Origin': 'http://localhost:3000'
            },
            body: JSON.stringify(payload)
        })
        const json = await resp.json()
        console.log(json)
        res.status(200).json(json);
    } catch (e) {
        console.log(e)
        res.status(500).json({
            error: e.message
        })
    }
});

app.listen(port, () => {
    console.log("This server is runng on port = ", port);
});