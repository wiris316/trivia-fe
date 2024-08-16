# Captrivia Frontend Application

## Overview

The is a real-time multiplayer Trivia game about cap tables with a retro gaming theme. Users can create or join games in the server, compete to answer questions first, and see real-time updates on a scoreboard and leaderboard. The frontend is developed using React and TypeScript, while the backend uses WebSockets for real-time communication. Please refer to './DECISIONS.md' for more information on development approach and decisions. 

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Websocket](https://img.shields.io/badge/websocket-%2320232a.svg?style=for-the-badge&logo=websocket&logoColor=%2361DAFB)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)

## Features

- **Effortless Connection to Server**: Establish a WebSocket connection to the server with a username.
- **Create Game**: Allows users to create new game sessions.
- **Join Game**: Users can join an existing game available in the Lobby.
- **Compete in Real-Time**: Answer questions in real-time with synchronized view for multiplayers.
- **Displayed Timer**: Show timer to countdown until correct answer is selected or when all players selected an answer.
- **Scoreboard**: Display player scores at the end of the game.
- **Leaderboard**: Display best scores of players sorted by accuracy and average time.

<div align="center">
<h6>Synchronized View for Multiplayer </h6>
<img src="https://github.com/user-attachments/assets/21b530a5-b1d0-4f5b-a315-8a99a992952f"/>
</div>

<div align="center">
<h6>Retro Gaming Theme with Responsive Design </h6>
<img src="https://github.com/user-attachments/assets/10ae4b0d-5186-44a5-9e5b-802f7f784823" width="400"/>
<img src="https://github.com/user-attachments/assets/8ead3ad7-cc18-4ccd-9d38-15496171ad6c" width="500"/>
</div>
  

## Application Structure

```bash
/trivia-fe
│ /src
│ ├── /assets
│ │ └── bg.svg
│ ├── /components
│ │ ├── /ConnectModal
│ │ │ ├── ConnectModal.tsx
│ │ │ └── ConnectModal.scss
│ │ ├── /GameRoom
│ │ │ ├── GameRoom.tsx
│ │ │ └── GameRoom.scss
│ │ ├── /Leaderboard
│ │ │ ├── Leaderboard.tsx
│ │ │ └── Leaderboard.scss
│ │ ├── /Lobby
│ │ │ ├── Lobby.tsx
│ │ │ └── Lobby.scss
│ │ ├── /ScoreBoard
│ │ │ ├── ScoreBoard.tsx
│ │ │ └── ScoreBoard.scss
│ │ ├── /TransitionMessage
│ │ │ ├── TransitionMessage.tsx
│ │ │ └── TransitionMessage.scss
│ │ └── /WaitingRoom
│ │ │ ├── WaitingRoom.tsx
│ │ │ └── WaitingRoom.scss
│ ├── /services
│ │ ├── api.ts
│ │ └── webSocketService.ts
│ ├── /styles
│ │ ├── _global.scss
│ ├── App.tsx
│ ├── index.css
│ └── interfaces.ts
│ Decisions.md
│ Dockerfile
│ index.html
│ README.md

```






