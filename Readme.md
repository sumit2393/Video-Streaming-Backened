NiceTube Backend (Node.js)
Description

This is the backend for NiceTube, a video streaming and sharing platform. Built with Node.js and Express, it provides APIs for managing users, videos, comments, playlists, and subscriptions. The backend handles video storage, streaming, authentication, and content management, powering both web and mobile clients.

Features / API Endpoints

User Management: Sign up, login, profile updates, and authentication (JWT).

Video Management: Upload, delete, edit, and fetch video metadata.

Streaming Support: Serve video files using range requests for smooth streaming.

Comments & Likes: Add, edit, delete comments and like/unlike videos.

Subscriptions: Subscribe/unsubscribe to channels and fetch subscribed content.

Playlists: Create, update, delete playlists and add videos to playlists.

Search & Discovery: Search videos by title, tags, or categories.



Tech Stack
Node.js – Runtime environment

Express.js – Web framework for REST APIs

MongoDB / PostgreSQL – Database for storing users, videos, and metadata

Multer – Video storage and upload handling

JWT / Passport.js – Authentication & authorization

