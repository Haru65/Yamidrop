# 🗂️ YamiDrop

YamiDrop is a secure, minimal SCP/SSH-based file-sharing SaaS platform. Built with a React + Node.js stack, it allows users to upload files directly to remote Linux servers using SSH credentials or pre-saved keys.

---

## 🚀 Features

- 🔐 Secure SSH authentication (key-based or password-based)
- 📁 File upload via SCP
- 🧠 Intelligent key existence check (avoids repeated password prompts)
- ⚙️ Dockerized backend for easy deployment
- 🌐 Frontend deployed on Vercel, backend on Render

---

## 🧱 Tech Stack

- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Auth & File Transfer:** SSH2, SCP2
- **Deployment:** 
  - Frontend: [Vercel](https://vercel.com)
  - Backend: [Render](https://render.com)
- **CI/CD:** GitHub + Docker

---

## 📦 Folder Structure

├── backend/ # Node.js + Express backend
│ └── Dockerfile
├── frontend/YamiDrop/ # React frontend app
├── .env # Environment variables
├── .gitignore
└── README.md


---

## 🛠️ Setup & Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Haru65/YamiDrop.git
cd YamiDrop

2. Backend Setup

cd backend
cp .env.example .env       
npm install
npm run dev

3. Frontend Setup

cd frontend/YamiDrop
npm install
npm run dev


🌍 Environment Variables

Create a .env file in the root and backend directory as needed. Example:

# Root-level .env
VITE_API_BASE_URL=renderlink

# backend/.env
ALLOWED_ORIGINS=vercel_deployed_link
PORT=5000

📤 Deployment

    Frontend: Push to GitHub → Vercel auto-deploys

    Backend: Use Dockerfile + Render or deploy to AWS/GCP

🙌 Contributing

PRs are welcome! If you have ideas to improve UX, performance, or security, feel free to fork and submit a pull request.



📄 License

MIT License © 2025 Haru65


---


# Yamidrop
