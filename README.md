#  TaskMatrix – Professional Task Management System

TaskMatrix is a modern **full-stack productivity application** built using the MERN stack.
It helps users manage tasks efficiently with a clean UI and structured workflow system inspired by tools like Trello.

---

##  Live Demo

*  **Frontend (Vercel):** https://prodesk-capstone-task-matrix.vercel.app/
*  **Backend (Render):** https://prodesk-capstone-taskmatrix-2.onrender.com
*  **Health Check API:** `/health`

---

##  Core Features

###  Authentication & Security

* Secure authentication using **JWT (JSON Web Tokens)**
* Password hashing with **Bcrypt**
* Protected routes (user-specific data isolation)

---

###  Task Management (CRUD)

*  Create tasks
*  View tasks
*  Edit/update tasks
*  Delete tasks

---

###  Workflow System

Organized task pipeline:

*  **To Do**
*  **In Progress**
*  **Completed**

---

###  AI-Powered Task Suggestions

* Integrated AI API (OpenRouter)
* Generates step-by-step breakdown of tasks
* Improves productivity and clarity

---

###  Real-Time UI Experience

* Instant updates without reload
* Smooth UX using React state management

---

###  Payment Integration

* Stripe Checkout (Test Mode)
* “Upgrade to Pro” feature
* Success page confirmation

---

###  UI/UX

* Clean & modern responsive design
* Mobile-friendly layout
* Alerts via SweetAlert2

---

##  Tech Stack

### Frontend

* React.js (Vite)
* Tailwind CSS
* React Router DOM
* SweetAlert2

### Backend

* Node.js
* Express.js
* MongoDB Atlas
* Mongoose
* JWT Authentication
* Bcrypt
* Stripe API
* OpenRouter API

---

##  Installation & Setup

### 1️ Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/taskmatrix.git
cd taskmatrix
```

---

### 2️ Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
STRIPE_SECRET_KEY=your_stripe_secret
OPENROUTER_API_KEY=your_ai_key
CLIENT_URL=http://localhost:5173
```

Run backend:

```bash
npm start
```

---

### 3️ Frontend Setup

```bash
cd frontend
npm install
```

Create `.env` file:

```env
VITE_API_URL=http://localhost:5000
```

Run frontend:

```bash
npm run dev
```

---

##  Deployment

### Frontend

* Hosted on **Vercel**

### Backend

* Hosted on **Render**

### Database

* MongoDB Atlas (Cloud)

---

##  Production Highlights

*  Secure CORS configuration (production-ready)
*  Environment variables handled securely
*  Fully deployed full-stack architecture
*  Live API + Database integration

---

##  Demo Video (Required for Internship)

 Add your Loom / YouTube demo link here

---

##  Author

 Ayush Gupta
BCA Student | Full Stack Developer


---

##  Final Note

This project demonstrates real-world full-stack development skills including:

* Authentication
* API Integration
* Payment Gateway
* AI Features
* Deployment

---

 Built as part of Prodesk Internship – Week 17 Capstone
