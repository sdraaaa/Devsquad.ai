# AI-Powered Multi-Agent Website/App Builder - Architecture Document

## 1. System Overview

The AI-Powered Multi-Agent Website/App Builder is a web application that utilizes multiple AI agents to automatically generate a complete project based on a user's description. The system allows users to input a project description and witness in real-time as five specialized AI agents (Emma, Bob, Alex, David, and Mike) collaborate to build a functional codebase, from requirements to implementation.

## 2. Tech Stack Specification

### Frontend
- **Framework**: React 18.x
- **Styling**: Tailwind CSS 3.x
- **Code Editor**: Monaco Editor 0.36.x or CodeMirror 6.x
- **State Management**: Context API for global state management
- **Real-time Communication**: Socket.IO Client 4.x
- **Build Tool**: Vite 4.x (faster development and optimized production builds)
- **Package Manager**: npm or yarn

### Backend
- **Runtime**: Node.js 18.x LTS
- **Framework**: Express 4.x
- **Real-time Server**: Socket.IO 4.x
- **File Storage**: File-based JSON store (no database required)
- **AI Integration**: OpenAI API (GPT-3.5-turbo)
- **Validation**: Joi or Zod for input validation
- **Error Handling**: Custom middleware for consistent error responses

## 3. Folder Structure

```
/
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   └── assets/
│   │       └── images/
│   ├── src/
│   │   ├── components/
│   │   │   ├── TeamBar/
│   │   │   ├── FileExplorer/
│   │   │   ├── CodeEditor/
│   │   │   ├── Console/
│   │   │   └── VersionModal/
│   │   ├── context/
│   │   │   ├── ProjectContext.jsx
│   │   │   └── WebSocketContext.jsx
│   │   ├── hooks/
│   │   │   └── useWebSocket.js
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── socket.js
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── index.jsx
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── projectController.js
│   │   │   ├── fileController.js
│   │   │   ├── versionController.js
│   │   │   └── agentController.js
│   │   ├── models/
│   │   │   ├── Project.js
│   │   │   └── FileSystem.js
│   │   ├── services/
│   │   │   ├── agentService.js
│   │   │   ├── storageService.js
│   │   │   └── socketService.js
│   │   ├── routes/
│   │   │   ├── projectRoutes.js
│   │   │   ├── fileRoutes.js
│   │   │   ├── versionRoutes.js
│   │   │   └── agentRoutes.js
│   │   ├── utils/
│   │   │   ├── logger.js
│   │   │   └── validators.js
│   │   ├── middleware/
│   │   │   └── errorHandler.js
│   │   ├── websocket/
│   │   │   └── socketManager.js
│   │   ├── config/
│   │   │   └── index.js
│   │   ├── data/
│   │   │   └── projects/
│   │   └── app.js
│   ├── package.json
│   └── .env.example
├── docs/
│   ├── PRD.md
│   └── Architecture.md
└── README.md
```

## 4. Component Diagrams

Please refer to the separate file `multiagent_app_builder_class_diagram.mermaid` for a detailed class diagram showing relationships between system components.

## 5. API Specifications

### Project Endpoints

#### `POST /api/start`
- **Description**: Initiates a new project based on user prompt
- **Request Body**: `{ "userPrompt": "Create a React + Firebase chat app with login..." }`
- **Response**: `{ "projectId": "unique-project-id" }`
- **Actions**: Creates a new project record, triggers the first agent (Emma)

#### `GET /api/:projectId`
- **Description**: Retrieves project metadata
- **Response**: Project object (without file contents)

### Agent Endpoints

#### `POST /api/:projectId/agent/:agentName`
- **Description**: Triggers a specific agent to perform its task
- **Request Body**: `{ "context": "Additional context if needed" }`
- **Response**: `{ "status": "success", "files": ["path/to/new/file1", "path/to/edited/file2"] }`
- **Actions**: Calls the AI agent, processes its output, saves files, broadcasts changes via WebSocket

### File Endpoints

#### `GET /api/:projectId/files`
- **Description**: Lists all file paths in the project
- **Response**: `{ "files": ["README.md", "docs/PRD.md", "src/App.jsx"] }`

#### `GET /api/:projectId/file`
- **Description**: Retrieves content of a specific file
- **Query Parameters**: `path` - The file path
- **Response**: `{ "content": "file content", "lastModified": "timestamp", "createdBy": "agent name" }`

#### `POST /api/:projectId/file`
- **Description**: Creates or updates a file
- **Request Body**: `{ "path": "path/to/file", "content": "file content", "agent": "User or agent name" }`
- **Response**: `{ "status": "success" }`
- **Actions**: Saves the file, broadcasts change via WebSocket

### Version Endpoints

#### `GET /api/:projectId/versions`
- **Description**: Lists all version snapshots
- **Response**: `{ "versions": [{ "id": "v1-timestamp", "timestamp": "ISO date", "description": "Emma completed PRD" }] }`

#### `POST /api/:projectId/restore`
- **Description**: Restores the project to a specific version
- **Request Body**: `{ "versionId": "v1-timestamp" }`
- **Response**: `{ "status": "success" }`
- **Actions**: Restores files from the specified snapshot, broadcasts changes via WebSocket

## 6. WebSocket Implementation

### Server-Side Setup

```javascript
// backend/src/websocket/socketManager.js
const socketIo = require('socket.io');

class WebSocketManager {
  constructor() {
    this.io = null;
  }

  initializeServer(httpServer) {
    this.io = socketIo(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST']
      }
    });
    
    this.io.on('connection', this.handleConnection.bind(this));
  }

  handleConnection(socket) {
    console.log(`Client connected: ${socket.id}`);
    
    socket.on('joinProject', (data) => {
      this.subscribeToProject(socket, data.projectId);
    });
    
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  }

  subscribeToProject(socket, projectId) {
    socket.join(`project:${projectId}`);
    console.log(`Client ${socket.id} joined project ${projectId}`);
  }

  broadcastFileCreated(projectId, fileData) {
    this.io.to(`project:${projectId}`).emit('fileCreated', fileData);
  }

  broadcastFileUpdated(projectId, fileData) {
    this.io.to(`project:${projectId}`).emit('fileUpdated', fileData);
  }

  broadcastAgentStarted(projectId, agentData) {
    this.io.to(`project:${projectId}`).emit('agentStarted', agentData);
  }

  broadcastAgentCompleted(projectId, agentData) {
    this.io.to(`project:${projectId}`).emit('agentCompleted', agentData);
  }

  broadcastVersionCreated(projectId, versionData) {
    this.io.to(`project:${projectId}`).emit('versionCreated', versionData);
  }

  broadcastConsoleLog(projectId, logData) {
    this.io.to(`project:${projectId}`).emit('consoleLog', logData);
  }
}

module.exports = new WebSocketManager();
```

### Client-Side Implementation

```javascript
// frontend/src/context/WebSocketContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useProjectContext } from './ProjectContext';

const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { currentProject, updateFileContent, addConsoleLog } = useProjectContext();

  useEffect(() => {
    const socketInstance = io(process.env.REACT_APP_API_URL || 'http://localhost:5000');
    
    socketInstance.on('connect', () => {
      setConnected(true);
      console.log('Connected to WebSocket server');
    });
    
    socketInstance.on('disconnect', () => {
      setConnected(false);
      console.log('Disconnected from WebSocket server');
    });
    
    setSocket(socketInstance);
    
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const connectToProject = (projectId) => {
    if (socket && projectId) {
      socket.emit('joinProject', { projectId });
      handleSocketEvents();
    }
  };

  const handleSocketEvents = () => {
    if (!socket) return;
    
    socket.on('fileCreated', (fileData) => {
      // Update the file explorer
      updateFileContent(fileData.path, fileData.content);
      addConsoleLog(`File created: ${fileData.path} by ${fileData.agent}`);
    });
    
    socket.on('fileUpdated', (fileData) => {
      updateFileContent(fileData.path, fileData.content);
      addConsoleLog(`File updated: ${fileData.path} by ${fileData.agent}`);
    });
    
    socket.on('agentStarted', (agentData) => {
      addConsoleLog(`${agentData.agent} (${agentData.role}) has started working...`);
    });
    
    socket.on('agentCompleted', (agentData) => {
      addConsoleLog(`${agentData.agent} completed work on ${agentData.files.length} files`);
    });
    
    socket.on('consoleLog', (logData) => {
      addConsoleLog(logData.message, logData.type);
    });
  };

  return (
    <WebSocketContext.Provider value={{ 
      socket, 
      connected, 
      connectToProject 
    }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
```

### WebSocket Events

#### Server to Client
- `fileCreated`: Broadcast when a file is created
- `fileUpdated`: Broadcast when a file is updated
- `agentStarted`: Broadcast when an agent starts working
- `agentCompleted`: Broadcast when an agent completes its task
- `versionCreated`: Broadcast when a new version snapshot is created
- `consoleLog`: Broadcast to add entries to the console log

#### Client to Server
- `joinProject`: Request to subscribe to project-specific events
- `requestAgentAction`: Request to trigger a specific agent

## 7. Database Schema (File-based JSON Store)

### Project File Structure
```json
{
  "projectId": "unique-project-id",
  "name": "Project Name",
  "description": "User's initial prompt or project description",
  "createdAt": "2023-06-02T12:00:00Z",
  "updatedAt": "2023-06-02T12:30:00Z",
  "files": {
    "README.md": {
      "content": "# Project Name\n...",
      "lastModified": "2023-06-02T12:30:00Z",
      "createdBy": "mike"
    },
    "docs/PRD.md": {
      "content": "# Product Requirements Document\n...",
      "lastModified": "2023-06-02T12:10:00Z",
      "createdBy": "emma"
    },
    "src/App.jsx": {
      "content": "import React from 'react';\n...",
      "lastModified": "2023-06-02T12:20:00Z",
      "createdBy": "alex"
    }
  },
  "versions": [
    {
      "id": "v1-timestamp",
      "timestamp": "2023-06-02T12:15:00Z",
      "description": "Emma completed PRD",
      "files": { /* Snapshot of files at this point */ }
    },
    {
      "id": "v2-timestamp",
      "timestamp": "2023-06-02T12:25:00Z",
      "description": "Bob completed Architecture",
      "files": { /* Snapshot of files at this point */ }
    }
  ],
  "currentAgentIndex": 4,
  "agentStatuses": [
    {
      "name": "emma",
      "role": "Product Manager",
      "status": "completed",
      "completedAt": "2023-06-02T12:15:00Z"
    },
    {
      "name": "bob",
      "role": "Architect",
      "status": "completed",
      "completedAt": "2023-06-02T12:20:00Z"
    },
    {
      "name": "alex",
      "role": "Engineer",
      "status": "completed",
      "completedAt": "2023-06-02T12:25:00Z"
    },
    {
      "name": "david",
      "role": "Data Analyst",
      "status": "completed",
      "completedAt": "2023-06-02T12:28:00Z"
    },
    {
      "name": "mike",
      "role": "Team Leader",
      "status": "completed",
      "completedAt": "2023-06-02T12:30:00Z"
    }
  ]
}
```

### Project Storage Implementation

```javascript
// backend/src/services/storageService.js
const fs = require('fs').promises;
const path = require('path');

class StorageService {
  constructor() {
    this.basePath = path.join(__dirname, '../data/projects');
  }

  async initialize() {
    try {
      await fs.mkdir(this.basePath, { recursive: true });
    } catch (error) {
      console.error('Error initializing storage directories:', error);
    }
  }

  getProjectPath(projectId) {
    return path.join(this.basePath, `${projectId}.json`);
  }

  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async readJson(filePath) {
    try {
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return null;
      }
      throw error;
    }
  }

  async writeJson(filePath, data) {
    const dirPath = path.dirname(filePath);
    await fs.mkdir(dirPath, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
  }

  async getProject(projectId) {
    const projectPath = this.getProjectPath(projectId);
    return this.readJson(projectPath);
  }

  async saveProject(projectId, projectData) {
    const projectPath = this.getProjectPath(projectId);
    await this.writeJson(projectPath, projectData);
  }

  async listProjects() {
    const files = await fs.readdir(this.basePath);
    const projectIds = files
      .filter(file => file.endsWith('.json'))
      .map(file => file.replace('.json', ''));
    
    return projectIds;
  }
}

module.exports = new StorageService();
```

## 8. Free-tier Cloud Setup Instructions

### Vercel Deployment

#### Frontend Deployment
1. Create a free Vercel account at https://vercel.com
2. Install Vercel CLI: `npm i -g vercel`
3. Initialize Vercel in the frontend directory: `cd frontend && vercel`
4. Set up the environment variables:
   ```
   vercel env add REACT_APP_API_URL
   ```
5. Deploy the frontend: `vercel --prod`

#### Configuration
- Build Command: `npm run build`
- Output Directory: `dist`
- Environment Variables:
  - `REACT_APP_API_URL`: URL to your backend API

### Heroku Deployment (Backend)

1. Create a free Heroku account at https://heroku.com
2. Install Heroku CLI: `npm install -g heroku`
3. Login to Heroku: `heroku login`
4. Create a new Heroku app: `heroku create your-app-name`
5. Add a Procfile to the backend directory:
   ```
   web: node src/app.js
   ```
6. Set environment variables:
   ```
   heroku config:set OPENAI_API_KEY=your-api-key
   heroku config:set FRONTEND_URL=https://your-frontend-url.vercel.app
   heroku config:set NODE_ENV=production
   ```
7. Deploy the backend:
   ```
   git subtree push --prefix backend heroku main
   ```

### Alternative: Railway.app Deployment

Railway.app also offers a generous free tier that's suitable for this project:

1. Create an account at https://railway.app
2. Create a new project
3. Connect your GitHub repository
4. Configure the deployment settings
5. Set up environment variables:
   - `OPENAI_API_KEY`
   - `FRONTEND_URL`
   - `NODE_ENV=production`

## 9. Security Considerations

### API Key Protection
- Store the OpenAI API key as an environment variable
- Never expose the API key in frontend code or commit it to version control

### Input Validation
- Validate all user inputs, particularly file paths and contents
- Use a validation library like Joi or Zod to enforce schema validation

### File Path Sanitization
- Sanitize file paths to prevent directory traversal attacks
- Example implementation:
  ```javascript
  function sanitizePath(filePath) {
    // Normalize the path to prevent directory traversal
    const normalized = path.normalize(filePath).replace(/^\/+/, '');
    
    // Check if path contains prohibited patterns
    if (normalized.includes('..') || normalized.startsWith('/')) {
      throw new Error('Invalid file path');
    }
    
    return normalized;
  }
  ```

### Rate Limiting
- Implement rate limiting for API endpoints to prevent abuse
- For example, using express-rate-limit:
  ```javascript
  const rateLimit = require('express-rate-limit');
  
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per window
    standardHeaders: true,
    legacyHeaders: false,
  });
  
  app.use('/api/', apiLimiter);
  ```

### Content Security
- Validate and sanitize file contents to prevent XSS attacks
- Implement Content Security Policy (CSP) headers

### Data Storage Security
- Ensure proper file permissions for the JSON storage directory
- Implement periodic backups of the data directory

### Error Handling
- Use a custom error handler that doesn't expose sensitive information
- Log errors properly but return sanitized error messages to clients

## 10. Implementation Roadmap

### Phase 1: Core Infrastructure
1. Set up basic Express backend with file-based storage
2. Create React frontend with basic UI components
3. Implement WebSocket connection between frontend and backend

### Phase 2: Agent Workflow
1. Implement the OpenAI API integration
2. Create agent prompt templates and response parsing
3. Set up the agent workflow sequencing

### Phase 3: File Management
1. Implement virtual file system for projects
2. Create the file explorer component
3. Implement code editor integration

### Phase 4: Versioning System
1. Implement version snapshots
2. Create version restore functionality
3. Add version history UI

### Phase 5: Deployment & Polish
1. Add error handling and validation
2. Implement security measures
3. Set up cloud deployment configurations
4. Optimize performance and UX

## 11. Conclusion

This architecture document outlines a comprehensive system design for a zero-cost, AI-powered multi-agent website/app builder. By using free-tier services and file-based storage, the application avoids recurring costs while providing a powerful collaborative environment for AI-assisted project development.

The system is designed for extensibility, allowing for future enhancements such as additional agent types, more sophisticated code generation, and potential integration with deployment platforms to enable one-click deployment of the generated applications.

## 12. References

- [Node.js Documentation](https://nodejs.org/en/docs/)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Express.js Documentation](https://expressjs.com/)
- [Socket.IO Documentation](https://socket.io/docs/v4/)
- [OpenAI API Documentation](https://platform.openai.com/docs/api-reference)
- [Vercel Documentation](https://vercel.com/docs)
- [Heroku Documentation](https://devcenter.heroku.com/)
