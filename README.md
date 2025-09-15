# Feastio Backend

Backend server for **Feastio**, responsible for handling API requests, authentication, and business logic.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Setup and Installation](#setup-and-installation)
- [Running the Server](#running-the-server)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

Feastio Backend provides the core server functionalities for the Feastio application.  
It includes API routing, middleware, authentication, and database interactions.

---

## Tech Stack

- **Runtime**: Node.js  
- **Language**: JavaScript  
- **Package Manager**: pnpm (recommended)  
- **Framework**: Express.js  
- **Database**: MongoDB
- **Authentication**: JWT  

---

## Folder Structure

```bash
FeastioBackend/
├── src/               # Application source code
│   ├── routes/        # API routes
│   ├── controllers/   # Route handlers and business logic
│   ├── models/        # Database models
│   └── utils/         # Utility functions
├── server.js          # Server entry point
├── package.json
├── pnpm-lock.yaml
└── .gitignore
```
---

## Setup and Installation

Clone the repository:

```bash
git clone https://github.com/kartikey004/FeastioBackend.git
cd FeastioBackend

# Using pnpm
pnpm install

# Or using npm
npm install

# Create a .env file in the root directory and configure the required environment variables

# Running the Server

# For development
pnpm dev

# For production
node server.js
```


---

## Contact

For any questions, issues, or suggestions regarding this project, you can reach out to:

- **Name**: Kartikey  
- **Email**: kartikeym004@gmail.com
- **GitHub**: [https://github.com/kartikey004](https://github.com/kartikey004)

