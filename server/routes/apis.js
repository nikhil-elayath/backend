const express = require("express");
const router = express.Router();
const {google}= require('googleapis');
const { response } = require("..");
const pg = require("pg-promise")();
const db = require("../db-init/dbConnection");
const config = require("config");
const youtubeAPIKey = config.get("youtubeAPIKey");
const currentDate= new Date()


// the api which connects with youtube's api and fetches data for the term 'cricket'
// orederd by date and all videos before the current date and time the api was called
router.get("/youtube-videos", async (req, res, next) => {

// getting search results from youtube api
// calling the api every 10 seconds

const gettingYoutubeData=()=>{
    setInterval(function(){google.youtube('v3').search.list({
        key:youtubeAPIKey,
        part:'snippet',
        q:"cricket",
        order:"date",
        publishedBefore: currentDate
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
            res.status(400).json({
              status: 400,
              message: "something went wrong",
            });

          }
        }
      }
      // if there is no data present not writing it to the db and sending a 200 response
      else{
        res.status(200).json({
          status: 200,
          message: "No data found",
        });


      }
    
    }).catch((err)=>console.log("err",err)) }, 10000);
  }

  gettingYoutubeData()


})

  // search api
  // @param
  //   1) keyword-> string
  // the keyword is the string which will be used to search the data for in the table against the columns
  // video title and video description
  router.post("/search", async (req, res, next) => {
    let keyword = req.body.keyword;
    try {
 
      const resultForVideoSearch = await db.any(
        `select * from youtube_videos where video_title ILIKE '%${keyword}%'
        union
        select * from youtube_videos where video_description ILIKE '%${keyword}%'
        `
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
  
  
  // getting all the videos from the db in a reverse order
  router.get("/all-videos", async (req, res, next) => {
    try {

      // implementing pagination
      let {page, size} = req.query
      if(!page)
      {
        page =1
      } 
      if(!size)
      {
        size=2
      }
      const limit = parseInt(size)
      const allVideos = await db.any(
        `select * from youtube_videos ORDER BY youtube_videos_id DESC LIMIT ${limit} `
      );
  
      res.status(200).json({
        status: 200,
        message: "all Videos fetched successfully",
        page:page,
        size:size,
        data: allVideos,

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