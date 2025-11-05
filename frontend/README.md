# Library Management System - Frontend

A modern, responsive web application built with React, TypeScript, and Tailwind CSS for managing library books and user authentication.

## 🛠️ Technology Stack

- **Framework**: React 19.1
- **Language**: TypeScript 5.9
- **Build Tool**: Vite 7.1
- **Styling**: Tailwind CSS 4.1 + Tailwind Animate
- **UI Components**: Shadcn UI (Radix UI primitives)
- **Routing**: React Router DOM 7.9
- **HTTP Client**: Axios 1.13
- **Icons**: Lucide React

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your machine:

- [Node.js](https://nodejs.org/) (version 18 or later)
- [npm](https://www.npmjs.com/) (comes with Node.js) or [yarn](https://yarnpkg.com/)
- A code editor (recommended: [Visual Studio Code](https://code.visualstudio.com/))
- (Optional) [Git](https://git-scm.com/) for version control

### Verify Installation

Check if Node.js and npm are installed:
```bash
node --version
npm --version
```
You should see Node.js version 18.x or later and npm version 9.x or later.

## 🚀 Getting Started (Step-by-Step)

### Step 1: Clone or Download the Project

If using Git:
```bash
git clone <repository-url>
cd library-management-frontend/frontend
```

Or download and extract the project, then navigate to the `frontend` folder.

### Step 2: Install Dependencies

Install all required npm packages:
```bash
npm install
```

This will download all dependencies listed in `package.json`, including:
- React and React DOM
- TypeScript
- Vite
- Tailwind CSS
- Shadcn UI components
- Axios for API calls
- React Router for navigation
- And other required packages

**Note**: This may take a few minutes on the first run.

### Step 3: Configure Backend API URL (Optional)

The app connects to the backend API at `http://localhost:5119` by default. To change this, create a `.env` file in the `frontend` folder:

```env
VITE_API_URL=http://localhost:5119
```

### Step 4: Start the Development Server

Run the development server:
```bash
npm run dev
```

The application will be available at:
- **Frontend URL**: `http://localhost:5173`
