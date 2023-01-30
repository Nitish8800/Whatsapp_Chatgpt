const express = require("express");
const axios = require("axios");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const app = express();
const Configuration = require("openai");
const OpenAIApi = require("openai");
// import { Configuration, OpenAIApi } from "openai"

dotenv.config();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.listen("3000", () => {
  console.log("listeing to port 3000");
});

app.get("/", (req, res) => {
  res.status(200).send("link is working");
});

app.get("/test", (req, res) => {
  res.status(200).send("path is working");
});

app.get("/webhook", function (req, res) {
  if (
    req.query["hub.mode"] == "subscribe" &&
    req.query["hub.verify_token"] == process.env.CALLBACK_VERIFY_TOKEN
  ) {
    res.send(req.query["hub.challenge"]);
  } else {
    res.sendStatus(400);
  }
});

app.post("/webhook", async function (request, response) {
  console.log("Incoming webhook: " + JSON.stringify(request.body));
  console.log("Received webhook: " + request.body)
  const myData = JSON.stringify(request.body)
  const myData2=JSON.parse(myData)
  const senderNumber = myData2.entry?.[0].changes?.[0].value.messages?.[0].from
  const messageText = myData2.entry?.[0].changes?.[0].value.messages?.[0].text.body;
  console.log({senderNumber});
  console.log({messageText});
if(messageText!==undefined){


    axios({
    method: "POST",
    url: "http://riyaz-openai.onrender.com/send_test_messages",
    headers: {
      "Content-Type": "application/json",
    },
    data: {
      text: messageText,
    },
  })
    .then((res) => {
      const answer = res.data;

      //  message sending call
      axios({
        method: "POST",
        url: `https://graph.facebook.com/v15.0/${process.env.PHONE_NUMBER_ID}/messages`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.VERIFY_TOKEN}`,
        },
        data: {
          messaging_product: "whatsapp",
          to:senderNumber,
          type: "text",
          text: { body: answer },
        },
      })
        .then(() => {
          response.send("message sent");
        })
        .catch(() => {
          response.send("not sent");
        });

      console.log(res.data);
    })
    .catch((err) => {
      response.send("meet error");
      console.log({ err });
    });
}
});

app.post("/send_message", (req, res) => {
  axios({
    method: "POST",
    url: `https://graph.facebook.com/v15.0/${process.env.PHONE_NUMBER_ID}/messages`,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.VERIFY_TOKEN}`,
    },
    data: {
      messaging_product: "whatsapp",
      to: "919399319620",
      type: "text",
      text: { body: `Hello, ${req.body.name}, ${req.body.message}` },
    },
  })
    .then(() => {
      res.send("message sent");
    })
    .catch(() => {
      res.send("not sent");
    });
});

//   let obj={"object":"whatsapp_business_account","entry":[{"id":"103365985989006","changes":[{"value":{"messaging_product":"whatsapp","metadata":{"display_phone_number":"917605058624","phone_number_id":"102952676030954"},"contacts":[{"profile":{"name":"Riyaz Ahmad"},"wa_id":"919399319620"}],"messages":[{"from":"919399319620","id":"wamid.HBgMOTE5Mzk5MzE5NjIwFQIAEhggMTlFODM2ODZENTczQjJBMDY1RDFBRjQ2NDYzMDIzRkIA","timestamp":"1673936290","text":{"body":"Hey"},"type":"text"}]},"field":"messages"}]}]}

// const senderNumber= obj.entry[0].changes[0].value.messages[0].from

// const messageText=obj.entry[0].changes[0].value.messages[0].text.body

let myData={"object":"whatsapp_business_account","entry":[{"id":"103365985989006","changes":[{"value":{"messaging_product":"whatsapp","metadata":{"display_phone_number":"917605058624","phone_number_id":"102952676030954"},"contacts":[{"profile":{"name":"Riyaz Ahmad"},"wa_id":"919399319620"}],"messages":[{"from":"919399319620","id":"wamid.HBgMOTE5Mzk5MzE5NjIwFQIAEhggREY4RTFFNTAzNTVDRjBFMjNBN0QxMUZCOUJBRDRDNzEA","timestamp":"1674019983","text":{"body":"Hello 👋"},"type":"text"}]},"field":"messages"}]}]}

// let myData2={myData}
// const senderNumber = myData2.myData.entry?.[0].changes?.[0].value.messages?.[0].from
// const messageText = myData.entry?.[0].changes?.[0].value.messages?.[0].text.body;
// console.log(senderNumber,messageText)