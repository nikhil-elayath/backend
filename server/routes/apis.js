const express = require("express");
const router = express.Router();
const {google}= require('googleapis');
const { response } = require("..");

// getting search results from youtube api
// calling the api every 10 seconds
const gettingYoutubeData=()=>{
    setInterval(function(){google.youtube('v3').search.list({
        key:"AIzaSyCzp5hDWDZzZqDVcl5s4m6VXivrhCJ1lZk",
        part:'snippet',
        q:"cricket"
    }).then((response)=>{
        console.log("reponse",response.data.items[0])
    
    }).catch((err)=>console.log("err",err)) }, 10000);
  }

  gettingYoutubeData()

