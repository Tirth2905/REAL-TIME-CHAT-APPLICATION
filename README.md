#REAL-TIME-CHAT-APPLICATION

COMPANY: CODTECH IT SOLUTIONS

NAME: SAVANI TIRTH NILESHBHAI

INTERN ID: CTIS9902

DOMAIN: MERN STACK WEB DEVELOPMENT

DURATION: 4 WEEEKS

MENTOR: NEELA SANTOSH


DISCRIPTION:-
Real-Time Chat Application
A full-stack real-time chat application built using React.js for the frontend and Socket.IO with Node.js for the backend. This project demonstrates the power of WebSocket-based communication, enabling multiple users to send and receive messages instantly on the same webpage without any page refresh.

🚀 Project Overview
This chat application allows multiple users to join a shared chat room, communicate in real time, and manage their own messages. The app is designed to be simple, clean, and functional — inspired by the familiar look and feel of modern messaging apps like WhatsApp. Every message appears instantly for all connected users, making it a true real-time experience powered by persistent WebSocket connections.
The project is divided into two parts: a client built with React.js and a server built with Node.js, Express, and Socket.IO. Both run locally and communicate over WebSockets on separate ports.

🛠️ Tech Stack
Frontend:

React.js (with Hooks — useState, useEffect, useRef)
Socket.IO Client
Plain CSS (no external UI library)

Backend:

Node.js
Express.js
Socket.IO


✨ Features
💬 Real-Time Messaging
All messages are broadcast instantly to every connected user using Socket.IO WebSockets. There is no need to refresh the page — as soon as one user sends a message, it appears on everyone's screen within milliseconds. This is the core feature of the application and showcases how WebSockets differ from traditional HTTP requests by maintaining a persistent, two-way connection between client and server.
👤 User Join Screen
When a user opens the app, they are greeted with a simple join screen asking for their name. Once they enter a name and click Join, they are added to the chat room and a system notification is broadcast to all other users informing them that someone new has joined. Similarly, when a user closes the tab or disconnects, a "left" notification is shown to everyone.
👥 Online Users Sidebar
The left sidebar displays a live list of all currently connected users. Each user is shown with their initials as an avatar and their display name. The current user is marked with a "You" label for easy identification. The list updates automatically whenever someone joins or leaves — no manual refresh needed.
✏️ Edit Messages
Users can edit their own messages after sending them. Hovering over a sent message reveals an Edit button. Clicking it opens an inline input field pre-filled with the original message text. The user can modify the text and press Enter or click Save to update it. An "edited" label appears next to the timestamp so other users know the message was modified. Only the original sender can edit their own messages — other users do not see the edit button on messages that aren't theirs.
🗑️ Delete Messages
Users can also delete their own messages. Hovering over a message shows a Delete button in red. Clicking it triggers a confirmation prompt, and if confirmed, the message is permanently removed from the chat for all users in real time. This is handled server-side, ensuring the message is removed from the in-memory store and the updated message list is broadcast to all connected clients.
✍️ Typing Indicator
When a user starts typing in the message input box, a typing indicator appears at the bottom of the chat area for all other users, showing "[Name] is typing…". The indicator disappears automatically after 1.5 seconds of inactivity or when the message is sent. This small but important feature significantly improves the conversational feel of the app.
➕ Add Person Button
The sidebar includes an "+ Add" button that opens a modal dialog. Here, you can enter someone's name and notify all connected users that a new person has been invited. The invited person simply needs to open the app in their own browser and enter the same name to join the conversation. This simulates a basic invite flow without requiring accounts or authentication.
🔔 System Notifications
Join and leave events are displayed as centered system messages in the chat, such as "Alice joined" or "Bob left". These are visually distinct from regular messages and help users keep track of who is in the room.

OUTPUT:-
<img width="1905" height="1077" alt="Image" src="https://github.com/user-attachments/assets/89af6206-f758-4021-acb8-0c33658140fc" />
