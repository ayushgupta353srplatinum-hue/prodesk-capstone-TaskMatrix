#  TaskMatrix – Smart Project Management System

##  Overview

TaskMatrix is a modern, scalable project management application inspired by industry-leading tools like Jira and Asana. It enables teams to efficiently manage workflows, track progress, and collaborate seamlessly using a Kanban-based interface.

---

##  Objective

The goal of TaskMatrix is to simulate a real-world team collaboration environment where users can:

- Organize projects  
- Manage tasks efficiently  
- Track progress visually  
- Improve productivity through structured workflows  

This project is being developed as a Capstone to showcase end-to-end development capabilities and readiness for professional software engineering roles.

---

##  Development Track

**Fullstack Development**

---

##  Tech Stack

###  Frontend
- React (Vite)
- Tailwind CSS
- Zustand / Redux Toolkit

###  Backend
- Node.js
- Express.js

###  Database
- MongoDB

###  Tools & Platforms
- Git & GitHub
- Figma (UI/UX Design)
- Draw.io / dbdiagram.io (Architecture Design)

---

##  Core Features

###  Authentication
- Secure user signup and login  
- Role-based access control (Admin / Member)  

###  Project Management
- Create and manage projects  
- Assign team members  

###  Task Management
- Create, edit, delete tasks  
- Assign tasks to users  
- Set priority (High, Medium, Low)  
- Add due dates  

###  Kanban Board
- Visual workflow (To Do → In Progress → Done)  
- Drag-and-drop functionality (planned)  

###  Collaboration
- Team roles & permissions  
- Shared workspace  

###  Activity Tracking
- Track task updates  
- Maintain history logs  

---

##  UI/UX Design (Wireframes)

The application UI is designed using Figma with a focus on:

- Clean and modern layout  
- Intuitive navigation  
- Responsive design (mobile + desktop)  

 **Figma Design:**  
[View TaskMatrix Design](https://www.figma.com/design/X2TkTfZD82m7pOnYUuMlXd/Untitled?node-id=0-1&p=f&t=w1V0MAWnWsukzn8t-0)

---

##  System Architecture

###  Database Design (MongoDB Collections)

- **Users** → Stores user credentials and roles  
- **Projects** → Contains project details and members  
- **Tasks** → Manages all task-related data  
- **ActivityLogs** → Tracks user actions  

###  Relationships

- A user can be part of multiple projects  
- A project can have multiple tasks  
- Each task is assigned to a user  
- Activity logs track actions performed by users  

---

##  Architecture Diagram

![ER Diagram](https://github.com/user-attachments/assets/db1b52f5-a2dd-46f4-a450-1ce08ebebbf8)

---

##  Project Structure (Planned)
client/
├── components/
├── pages/
├── store/

server/
├── controllers/
├── routes/
├── models/
├── middleware/
---

##  Setup Instructions (Planned)

1. Clone the repository  
2. Install dependencies using npm  
3. Setup environment variables  
4. Run frontend and backend servers  

---

##  Responsiveness

TaskMatrix is designed to be fully responsive and accessible across:

- Desktop  
- Tablet  
- Mobile devices  

---

##  Future Enhancements

- Real-time updates using WebSockets  
- AI-based task suggestions  
- Notifications system  
- File attachments in tasks  

---

##  Key Learnings

This project will help in gaining hands-on experience with:

- Scalable application architecture  
- State management in complex UIs  
- REST API design  
- Database modeling  
- Real-world problem solving  

---

##  Conclusion

TaskMatrix is not just a project, but a complete simulation of real-world software development. It reflects the ability to design, plan, and build scalable applications with industry-relevant technologies.
