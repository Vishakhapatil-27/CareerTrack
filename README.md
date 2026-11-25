# CareerTrack – Personal Job Application Tracker

CareerTrack is a full-stack web application that helps users manage and track their job applications in one place.

## Features

- Add new job applications
- Edit and delete applications
- Search applications by company or role
- Filter applications by status
- Dashboard with application statistics
- Analytics for tracking application progress
- MongoDB database integration
- Responsive user interface

## Tech Stack

**Frontend:**
- HTML
- CSS
- JavaScript

**Backend:**
- Node.js
- Express.js

**Database:**
- MongoDB Atlas
- Mongoose

## Project Structure

```text
CareerTrack/
├── backend/
│   ├── Application.js
│   ├── server.js
│   └── package.json
├── index.html
├── style.css
├── script.js
└── .gitignore
```

## Installation and Setup

1. Clone the repository:

```bash
git clone https://github.com/Vishakhapatil-27/CareerTrack.git
```

2. Navigate to the project folder:

```bash
cd CareerTrack
```

3. Install backend dependencies:

```bash
cd backend
npm install
```

4. Create a `.env` file inside the backend folder:

```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
```

5. Start the backend server:

```bash
node server.js
```

6. Open `index.html` using VS Code Live Server.

## Author

Vishakhapatil-27

## License

This project is created for learning and portfolio purposes.
