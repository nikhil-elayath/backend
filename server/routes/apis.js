const express = require("express");
const router = express.Router();
const {google}= require('googleapis');
const { response } = require("..");
const pg = require("pg-promise")();
const db = require("../db-init/dbConnection");
const config = require("config");
// const youtubeAPIKey = config.get("youtubeAPIKey");
const currentDate= new Date()



router.post("/youtube-videos", async (req, res, next) => {

// getting search results from youtube api
// calling the api every 10 seconds

const gettingYoutubeData=()=>{
    setInterval(function(){google.youtube('v3').search.list({
        key:'AIzaSyCzp5hDWDZzZqDVcl5s4m6VXivrhCJ1lZk',
        part:'snippet',
        q:"football",
        order:"date",
        publishedAfter: currentDate
    }).then(async(response)=>{
        var video_title
        var video_description
        var video_published_date
        var video_thumbnail_url;
      if(response.data.items.length!=0)
      {
        for(data of response.data.items)
        {
          video_title=data.snippet.title
          video_description=data.snippet.description
          video_published_date=data.snippet.publishTime
          video_thumbnail_url=data.snippet.thumbnails.high.url 
        try {
          const result = await db.one(
            `INSERT INTO youtube_videos(video_title,video_description, video_published_date, video_thumbnail_url) VALUES($1, $2, $3, $3) RETURNING youtube_videos_id`,
            [
              video_title,
              video_description,
              video_published_date,
              video_thumbnail_url,
             
            ]
          );

          } catch (err) {
            console.log(err);

          }
        }
      }
    
    }).catch((err)=>console.log("err",err)) }, 10000);
  }

  gettingYoutubeData()


})

  // search api
  router.post("/search", async (req, res, next) => {
    let keyword = req.body.keyword;
    try {
 
      const resultForVideoSearch = await db.any(
        `select * from youtube_videos where video_title ILIKE '%${keyword}%'`
      );
  
      res.status(200).json({
        status: 200,
        message: "videos fetched successfully",
        data: resultForVideoSearch,
      });
    } catch (err) {
      console.log(err);
      res.status(400).json({
        status: 400,
        message: "videos could not be fetched",
      });
    }
  });
  module.exports = router;