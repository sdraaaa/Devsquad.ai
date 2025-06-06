# Multi-Agent App Builder

This project implements a zero-cost, AI-powered multi-agent website/app builder that collaboratively translates user requirements into fully functional web applications through the coordination of specialized AI agents.

## Overview

The Multi-Agent App Builder leverages a team of specialized AI agents, each with distinct roles:

- **Emma (Product Manager)**: Creates PRDs with feature specifications and user stories
- **Bob (Architect)**: Designs system architecture and technology stack
- **Alex (Engineer)**: Implements code and core functionality
- **David (Data Analyst)**: Designs data models and security rules
- **Mike (Team Leader)**: Reviews output and creates documentation

The system supports real-time collaboration through WebSockets and provides file editing, version control, and project management features.

## Project Structure

```
├── backend/                # Backend Node.js server
│   ├── controllers/       # API route handlers
│   ├── services/          # Business logic
│   ├── routes/            # API route definitions
│   ├── middleware/        # Express middleware
│   ├── utils/             # Utility functions
│   └── server.js          # Main server file
│
├── src/                   # Frontend React application
│   ├── components/        # React components
│   │   ├── Console/       # Console log components
│   │   ├── Editor/        # Code editor components
│   │   ├── FileExplorer/  # File explorer components
│   │   ├── TeamBar/       # Team display components
│   │   ├── Versioning/    # Version control components
│   │   └── common/        # Reusable UI components
│   ├── context/           # React context providers
│   ├── services/          # API and socket services
│   ├── utils/             # Utility functions
│   ├── App.jsx            # Main application component
│   └── main.jsx           # Entry point
│
└── docs/                  # Documentation
    ├── PRD.md             # Product Requirements Document
    └── Architecture.md    # Architecture Document
```

## Installation

### Prerequisites

- Node.js 16.x or later
- npm or pnpm
- OpenAI API key (for backend AI agents)

### Frontend Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/multi-agent-app-builder.git
cd multi-agent-app-builder

# Install frontend dependencies
pnpm install

# Start the development server
pnpm run dev
```

### Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Install backend dependencies
pnpm install

# Copy the example environment file and add your OpenAI API key
cp .env.example .env

# Start the backend server
pnpm run dev
```

## Usage

1. Open the application in your browser at http://localhost:5173
2. Enter your project description in the input field (e.g., "Create a React + Firebase chat app with login and admin dashboard")
3. Click "Start" to initialize the project
4. Emma (PM) will begin by creating a PRD, followed by other agents working in sequence
5. Monitor progress in the Console and explore files in the File Explorer
6. Edit files directly in the Code Editor
7. Use the Versions feature to create and restore project snapshots

## Features

- **Multi-Agent Collaboration**: AI agents with specialized roles work together
- **Real-Time Updates**: WebSockets provide live updates on agent activities
- **Interactive Code Editor**: Monaco-based editor with syntax highlighting
- **File Explorer**: Navigate and manage project files
- **Version Control**: Create and restore project snapshots
- **Activity Logs**: Track agent actions and project history

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
