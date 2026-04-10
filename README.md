
 🎮 Tic Tac Toe Web Application

 Overview

This project is a **full-stack Tic Tac Toe web application** developed using **HTML, CSS, JavaScript (frontend)** and **Java (backend)**.

It is designed as a modern game application with **AI support, level system, and interactive UI**.



 Features

 Game Modes

* **Player vs Computer**

  * Includes difficulty levels (Easy, Medium, Hard)
  * Level-based system (150 levels)
  * Next level unlocks after winning
* **Player vs Player**

  * Free play mode (no levels)



 AI Logic

* Easy → random moves
* Medium → basic strategy
* Hard → strong logic (minimax)



Scoring System

* Win → 3 stars
* Draw → 1 star
* Loss → 0 stars

Tracks:

* Score
* High Score
* Total Stars



 Timer

* Starts when game begins
* Stops when game ends



 Hint Feature

* Suggests best move
* Highlights recommended cell



Sound Effects

* Move sound
* Win / Lose / Draw
* Hint sound



 UI Design

* Dark theme
* Clean layout
* Game-like interface



 Tech Stack

**Frontend**

* HTML
* CSS
* JavaScript

**Backend**

* Java (Spring Boot / Servlets)

Database 

* MySQL / SQLite



 Project Structure


tictactoe/
│
├── src/
│   ├── main/
│   │   ├── java/              → Backend code
│   │   ├── resources/
│   │   │   ├── static/        → HTML, CSS, JS
│   │
│   └── test/
│
├── build.gradle
├── settings.gradle
├── gradlew
├── gradlew.bat


