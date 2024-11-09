# Full-Stack Assignment

This repository contains a full-stack project with separate frontend and backend applications. The frontend is built using Next.js, and the backend is built with FastAPI. The project is organized with two main folders: `Frontend` and `Backend`.

## Project Architecture

The project follows a **client-server architecture**, where the **frontend (Next.js)** and **backend (FastAPI)** communicate via REST APIs. This modular approach ensures clear separation of concerns, making it easier to develop, maintain, and deploy each component independently.

### Architecture Overview

1. **Frontend (Next.js)**
   - Acts as the client-side application, handling user interactions and displaying data to users.
   - Communicates with the backend server via API calls to fetch or send data.
   - Built using the Next.js framework, which allows for server-side rendering (SSR) and static generation, optimizing performance.

2. **Backend (FastAPI)**
   - Acts as the server-side application, handling API requests, business logic, and data processing.
   - Built using FastAPI, a high-performance web framework for building APIs with Python.
   - Contains endpoints that the frontend communicates with to retrieve data or perform actions.

3. **API Communication**
   - The frontend interacts with the backend through HTTP requests to specific endpoints defined in the FastAPI backend.
   - JSON is used as the data format for communication between frontend and backend.

### Folder Structure

```plaintext
Full-Stack-Assignment/
├── Frontend/             # Frontend application (Next.js)
│   ├── src/app           # Next.js pages and routes
│   ├── src/components/   # Reusable UI components
│   ├── public/           # Static files
│   └── ...               # Other frontend files
├── Backend/              # Backend application (FastAPI)
│   ├── api/              # Main application code
│   ├── .env              # Route Environment Variables
│   └── ...               # Other backend files
└── README.md             # Main project README
```

### Getting Started
#### To run the project, refer to the individual README files located in each folder:

- Frontend README: Instructions to set up and run the Next.js frontend.
- Backend README: Instructions to set up and run the FastAPI backend.

### Note
Ensure both the frontend and backend servers are running simultaneously. The frontend will interact with the backend API for data processing and functionality.
