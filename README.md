# Todo App

## Overview

This application is a simple web-based todo list that allows users to create and manage their daily tasks.

## Features

The main features of the application are:

1. Add new tasks.
2. Mark tasks as completed or incomplete.
3. Add and update task descriptions.
4. Mark or unmark tasks as favourites.
5. Display favourite tasks in a separate section.
6. Delete tasks from the list.
7. Automatically load and update the task list when changes are made.

## Tech Stack

The application uses the following technologies:

- **Frontend:** React, TypeScript, Vite and Tailwind CSS.
- **Backend:** Python with FastAPI to manage REST API endpoints.
- **Data storage:** Tasks are stored in a local JSON file.

## Testing

The backend API endpoints were tested manually using FastAPI's Swagger UI, available at:

http://localhost:8000/docs

## Installation

Make sure Python, Node.js and npm are installed before starting.

### 1. Backend setup

Create a virtual environment and install the backend dependencies:

```bash
cd backend
python -m venv .venv
```

**Note:** On some systems, especially macOS and Linux, you may need to use `python3` instead of `python`:

```bash
python3 -m venv .venv
```

Activate the virtual environment:

**Windows (PowerShell):**
```powershell
.\.venv\Scripts\Activate.ps1
```

**macOS / Linux:**
```bash
source .venv/bin/activate
```

Install the dependencies:

```bash
pip install -r requirements.txt
```

### 2. Frontend setup

Install the frontend dependencies:

```bash
cd ../frontend
npm install
```

### 3. Run the application

From the `frontend` directory, run:

```bash
npm run dev
```

This command starts both the frontend and backend servers.

### 4. Access the application

Open your browser and navigate to:

- **Frontend:** http://localhost:5173
- **Backend API documentation:** http://localhost:8000/docs

## Implementation Notes

During this technical test, several changes were made to the original application.

One of the first changes was adding an **ID field** to each task in order to identify them correctly.

New endpoints were implemented to support new functionalities.

Instead of keeping all the backend code in a single file (main.py), I organised it into routes, services, models and dependencies to separate responsibilities and make the code easier to understand and maintain.

- **Routes:** Define the API endpoints and call the service methods.
- **Services:** Manage tasks and save changes to the JSON file.
- **Models:** Define the data structure and check that the data is valid.
- **Dependencies:** Create and provide the services used by the routes.

On the frontend, I reused much of the existing React code, making some modifications and adapting it to support the new features.

