# GreenConnect 🌱– Connecting People for a Greener Future

## 📝 Description  
GreenConnect is a real-time online chat application designed to bring together individuals and communities who care about the environment.
Built with Node.js and Socket.IO, it allows users to join global or community-based chat rooms, communicate instantly, and share useful resources such as images and PDF documents.

The app supports user authentication and community creation, providing a focused and interactive platform for collaborative discussions.

## 🚀 Features
- 🔐 User Signup & Secure Login System
- 💬 Real-time Global and Community Chat (Socket.io)
- 🌱 Create & Join Environment-Focused Chat Communities
- 📎 Share Media — Images and PDFs via File Upload
- 🧩 Modular backend structure for scalability
- 🌐 EJS-rendered dynamic UI with interactive JS

## 🧰 Tech Stack

- **Frontend**: HTML, CSS, EJS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (with Mongoose)
- **WebSocket**: Socket.io
- **Other**:
  - Bcrypt for password hashing
  - Express-session for session handling
  - Custom middleware for auth

## 📂 Folder Structure 
```text
GreenConnect/
│
├── controllers/          # Route logic & handlers
├── middlewares/          # Auth checks and custom logic
├── models/               # Mongoose schemas
├── public/
│   ├── css/              # Stylesheets (style.css)
│   ├── js/               # Frontend scripts (chat, socket logic - user side)
│   └── index.html        # Landing page
├── routes/               # Express route handlers
├── service/              # Business logic (auth)
├── socket/               # Real-time socket communication logic
├── utils/                # Utility functions
├── views/                # EJS templates for rendering UI
├── index.js              # Main server file
├── package.json          # Project metadata and dependencies
└── README.md             # This file
