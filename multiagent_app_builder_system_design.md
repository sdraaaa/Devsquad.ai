# AI-Powered Multi-Agent Website/App Builder - System Design

## Implementation approach
To create a zero-cost, AI-powered multi-agent website/app builder, we'll implement a full-stack application with the following approach:

1. **Frontend**: React with Tailwind CSS for a responsive interface, featuring a Monaco or CodeMirror editor for real-time code editing, and Socket.IO client for real-time updates.

2. **Backend**: Node.js with Express for API endpoints and Socket.IO for real-time communication. We'll use a file-based JSON store for maintaining project data without requiring paid databases.

3. **Agent System**: We'll use Together AI's cost-effective models like Llama-2-70b-chat-hf to power the multi-agent workflow (Emma → Bob → Alex → David → DevOps Engineer), each with specific responsibilities for building complete, deployable websites.

4. **Storage & Versioning**: A file-based JSON storage system will maintain the entire file tree and project versions as timestamped snapshots, allowing users to restore previous states.

5. **Real-time Collaboration**: Socket.IO will be used to broadcast file changes, agent actions, and system events to all connected clients.

The implementation will focus on creating a seamless experience where users input a project description and witness the agents collaboratively building a complete project structure in real-time.

### Difficult Points & Solutions

1. **Agent Coordination**: Ensuring each agent has access to the outputs and context from previous agents. Solution: Implement a context-passing system between agent calls.

2. **Real-time File Updates**: Managing concurrent edits and ensuring all clients stay synchronized. Solution: Use WebSocket events to broadcast file changes.

3. **Versioning System**: Creating efficient snapshots without excessive storage usage. Solution: Store only changed files between versions using a delta approach.

4. **Cost Management**: Keeping the application within free tier limitations. Solution: Implement rate limiting, caching, and optimize API usage patterns.

5. **Agent Output Parsing**: Ensuring consistent JSON output from AI agents. Solution: Implement robust parsing and validation logic with error recovery mechanisms.

### Open-Source Tools and Libraries

- **Frontend**: React, Tailwind CSS, Monaco Editor/CodeMirror, Socket.IO Client
- **Backend**: Node.js, Express, Socket.IO, lowdb/JSONbin
- **AI Integration**: OpenAI Node.js SDK
- **Development**: Webpack, Babel, ESLint
- **Deployment**: Vercel/Heroku free tier

## Data structures and interfaces

The system will be composed of several key components:

1. **Project Manager**: Handles project creation, retrieval, and versioning
2. **Agent Manager**: Coordinates agent activities and maintains workflow
3. **File System**: Manages the virtual file system for each project
4. **Websocket Manager**: Handles real-time communication
5. **UI Components**: Frontend interface elements

Note: The detailed class diagrams are available in the separate file `multiagent_app_builder_class_diagram.mermaid`.

## Program call flow

The application flow begins with the user inputting a project description and clicking "Start". This triggers the agent workflow, with each agent generating files and updates, which are then broadcast to connected clients.

Note: The detailed sequence diagrams are available in the separate file `multiagent_app_builder_sequence_diagram.mermaid`.

## Tech Stack Specifications

### Frontend
- **Framework**: React 18.x
- **Styling**: Tailwind CSS 3.x
- **Code Editor**: Monaco Editor 0.36.x or CodeMirror 6.x
- **State Management**: Context API or Redux Toolkit
- **Real-time Communication**: Socket.IO Client 4.x
- **Build Tools**: Vite 4.x
- **Package Manager**: npm or yarn

### Backend
- **Runtime**: Node.js 18.x LTS
- **Framework**: Express 4.x
- **Real-time Server**: Socket.IO 4.x
- **File Storage**: lowdb 6.x or custom JSON file handling
- **AI Integration**: Together AI API (Llama-2-70b-chat-hf)
- **Authentication**: JWT (for potential future expansion)

## Folder Structure

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

## Database Schema (File-based JSON Store)

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

## API Specifications

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

## WebSocket Events

### Server to Client

#### `fileCreated`
- **Data**: `{ "path": "path/to/file", "content": "file content", "agent": "agent name" }`
- **Actions**: UI updates file explorer and opens file if relevant

#### `fileUpdated`
- **Data**: `{ "path": "path/to/file", "content": "new content", "agent": "agent name" }`
- **Actions**: UI updates file content if open

#### `agentStarted`
- **Data**: `{ "agent": "agent name", "role": "agent role" }`
- **Actions**: UI highlights active agent

#### `agentCompleted`
- **Data**: `{ "agent": "agent name", "files": ["path/to/file1", "path/to/file2"] }`
- **Actions**: UI updates agent status, logs completion

#### `versionCreated`
- **Data**: `{ "versionId": "v1-timestamp", "description": "Emma completed PRD" }`
- **Actions**: UI updates versions list

#### `consoleLog`
- **Data**: `{ "message": "Log message", "type": "info|warning|error" }`
- **Actions**: UI adds message to console log

### Client to Server

#### `joinProject`
- **Data**: `{ "projectId": "unique-project-id" }`
- **Actions**: Server subscribes client to project-specific events

#### `requestAgentAction`
- **Data**: `{ "agent": "agent name", "projectId": "unique-project-id" }`
- **Actions**: Server triggers the specified agent

## Free-tier Cloud Setup

### Vercel Deployment
1. Create a free Vercel account
2. Connect your GitHub repository
3. Configure build settings:
   - Frontend build command: `cd frontend && npm install && npm run build`
   - Frontend output directory: `frontend/dist`
   - Backend: Set up as a separate Serverless Functions project
4. Environment variables:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `NODE_ENV`: `production`

### Heroku Deployment
1. Create a free Heroku account
2. Install Heroku CLI
3. Configure the app:
   ```
   heroku create app-name
   heroku config:set OPENAI_API_KEY=your-api-key
   git push heroku main
   ```

## Security Considerations

1. **API Key Protection**: Store the Together AI API key as an environment variable
2. **Input Validation**: Validate all user inputs, especially file paths
3. **File Path Sanitization**: Prevent directory traversal attacks
4. **Rate Limiting**: Implement rate limiting for API endpoints to prevent abuse
5. **Content Security**: Validate and sanitize file contents to prevent XSS
6. **Future Enhancement**: Add user authentication if the app grows beyond personal use

## Anything UNCLEAR

1. **Agent Implementation Details**: The exact prompts and instructions for each agent need to be carefully crafted to ensure consistent JSON output format.

2. **Error Recovery**: How to handle situations where an agent fails to produce valid output or encounters errors needs further consideration.

3. **OpenAI Rate Limits**: Free tier limitations may affect the usability of the application during peak times.

4. **Long-term Storage**: As projects grow, the file-based JSON store might become inefficient. A migration strategy to a more scalable solution may be needed in the future.
