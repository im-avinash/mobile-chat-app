# mobile-chat-app
MVP real-time 1:1 chat with auth, user list, online status, typing indicator, delivery/read receipts, and message persistence.
Chat App (client (React Native) and server (Node.js + Express + Socket.IO) organized clearly)
mobile-chat-app/
├── client/                           # React Native (Expo) app 📱
│   ├── src/
│   │   ├── api/                      # API calls to backend
│   │   │   └── authApi.js
│   │   ├── components/               # Reusable UI components
│   │   │   ├── MessageBubble.js
│   │   │   └── UserListItem.js
│   │   ├── context/                  # Global state (Auth, Socket)
│   │   │   ├── AuthContext.js
│   │   │   └── SocketContext.js
│   │   ├── pages/                    # App screens
│   │   │   ├── LoginScreen.js
│   │   │   ├── HomeScreen.js
│   │   │   └── ChatScreen.js
│   │   ├── services/                 # WebSocket / API services
│   │   │   └── socketService.js
│   │   ├── utils/                    # Helpers (time, validation, etc.)
│   │   │   └── time.js
│   │   └── App.js                    # App entry, navigation setup
│   ├── package.json
│   └── app.json                      # Expo config
│
├── server/                           # Node.js + Express backend 🖥️
│   ├── src/
│   │   ├── bin/
│   │   │   └── www.js                # Server start script
│   │   ├── config/
│   │   │   └── db.js                 # MongoDB connection
│   │   ├── middleware/
│   │   │   └── auth.js               # JWT auth middleware
│   │   ├── models/                   # Mongoose models
│   │   │   ├── User.js
│   │   │   ├── Message.js
│   │   │   └── Conversation.js
│   │   ├── routes/                   # REST API routes
│   │   │   ├── authRoutes.js
│   │   │   └── userRoutes.js
│   │   ├── services/                 # Business logic (DB operations)
│   │   │   └── messageService.js
│   │   ├── socket/                   # Socket.IO event handlers
│   │   │   ├── index.js
│   │   │   └── messageHandler.js
│   │   ├── app.js                    # Express app setup
│   │   └── server.js                 # Entry point (HTTP + Socket.IO)
│   ├── .env                          # Secrets (DB URI, JWT secret)
│   └── package.json
│
├── shared/                           # Shared utilities (optional)
│   ├── constants.js
│   └── validators.js
│
├── README.md
└── package.json                      # Root package for monorepo

## 🚀 Features
- 🔑 **Authentication** (Register/Login with JWT)
- 👥 **User List** – view all users and start a conversation
- 💬 **Real-Time Messaging** using Socket.IO
- 📂 **Message Persistence** – stored in MongoDB
- ✍️ **Typing Indicators**
- 🟢 **Online/Offline Status**
- ✅ **Message Delivery & Read Receipts**
- 📱 **Cross-platform**: Works on Android & iOS (via Expo)

## ⚙️ Tech Stack

### **Frontend (Client)**
- React Native (Expo)
- React Navigation
- Context API (Auth & Socket)
- Axios (API calls)

### **Backend (Server)**
- Node.js + Express
- MongoDB + Mongoose
- Socket.IO (real-time messaging)
- JWT (authentication)


## 🛠️ Setup & Installation

### 1️⃣ Clone the Repository
git clone https://github.com/your-username/mobile-chat-app.git
cd mobile-chat-app

## Install Dependencies client
cd mobile-chat-app/client
npm install

## Install Dependancies Server
cd mobile-chat-app/server
npm install


##Setup Environment Variables
Create a .env file inside the server/ directory:
PORT=4000
MONGO_URI=mongodb://localhost:27017/chatapp
JWT_SECRET=your_jwt_secret

## Run the Backend Server
cd server
npm start

## Run the Client App
cd client
npx expo start

## API Endpoints (Backend)
Method              Endpoint                 Description
POST                /auth/register           Register new user
POST                /auth/login              Login user & get JWT
GET                 /users                   Get all users (protected)

##  Socket.IO Events

Event               From → To                Description
join                Client → Server          User joins chat room
sendMessage         Client → Server          Send message
message             Server → Client          Receive message
typing              Client ↔ Server          Typing indicator
onlineUsers         Server → Client          List of online users

## License
This project is licensed under the MIT License.

Author

Avinash Singh
📧 avi4shivam@gmail.com
