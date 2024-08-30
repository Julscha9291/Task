# Task Management Application

## Overview

This Task Management Application integrates React for the frontend and Django for the backend, providing a seamless user experience for task and project management. 

## Features

- **Login System**: Users can log in using their credentials, and there is a special guest login available for visitors.
- **Summary Page**: Displays a summary of tasks, deadlines, and weather information.
- **Kanban Board**: Tasks are organized in a Kanban board, allowing users to view and manage tasks. Users can create tasks for colleagues, and notifications are sent to all users upon task creation.
- **Contacts Page**: Lists all users and their email addresses for easy communication.

## Installation

To run the application locally:

1. **Clone the Repository**

   ```bash
   git clone https://github.com/Julscha9291/Task
   cd Task

2. **Set Up the Backend**

- Navigate to the Django backend directory.

- Install dependencies:
```bash
pip install -r requirements.txt
```
- Apply migrations:
```bash
python manage.py migrate
```
- Start the Django server:
```bash
python manage.py runserver
```
3. **Set Up the Frontend**

- Install dependencies:
```bash
npm install
```

- Start the React development server:
```bash
npm start
```

## Usage

- Access the application at http://localhost:3000 for the frontend and http://localhost:8000 for the backend.
- Use the login system to access the main features or the guest login for limited access.
- Navigate to the Summary Page for an overview of tasks and weather.
- Use the Kanban Board to manage tasks and view notifications.
- Check the Contacts Page to view user information.

## Contributing

Feel free to submit issues, feature requests, or pull requests. Your contributions are welcome!