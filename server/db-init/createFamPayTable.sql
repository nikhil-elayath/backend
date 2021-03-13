drop database if exists fampay;
create database fampay;

\c fampay;

CREATE TABLE youtube_videos
(
    youtube_videos_id serial,
    video_title VARCHAR(255),
    video_description VARCHAR(255),
    video_published_date DATE,
    video_thumbnail_url VARCHAR(255),

    PRIMARY KEY(youtube_videos_id)
);
