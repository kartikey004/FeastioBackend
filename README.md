# Feastio Backend

Backend server for **Feastio**, responsible for handling API requests, authentication, and business logic.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Setup and Installation](#setup-and-installation)
- [Running the server](#running-the-server)
- [Contact](#contact)

---

## Overview

Feastio Backend is the server-side component of the Feastio platform, built using **Node.js** and **Express.js**, with **MongoDB** for data storage and **Firebase** for additional services.  

The backend provides the core functionality to support the AI-driven meal planning and health assistant, including:  

- API endpoints to manage 7-day meal plans, including ingredients, cooking time, and detailed macronutrient information.  
- Integration with the **Gemini API** to facilitate a conversational health and fitness assistant.  
- Daily nutrition tips management, including auto-refreshing content for enhanced user engagement.  
- User personalization logic based on diet, allergies, activity levels, and health preferences.  
- Support for **Menstrual Health** preferences (Regular, Irregular, PCOS, Menopause) for female users, enabling context-aware and inclusive meal planning.  
- Secure authentication and authorization, including OTP email verification via Nodemailer.  

Feastio Backend ensures a robust, scalable, and secure foundation for delivering a personalized nutrition and health experience across the platform.

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
```
---

## Running the Server

```bash
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

