// backend/controllers/agentController.js
const fileService = require('../services/fileService');
const togetherService = require('../services/openaiService'); // Note: keeping same filename for compatibility
const socketService = require('../services/socketService');
const { AGENT_ROLES } = require('../utils/constants');

/**
 * Run an agent to process a task
 */
exports.runAgentHandler = async (req, res, next) => {
  const { projectId, agentName } = req.params;
  
  // Check if the agent exists
  if (!AGENT_ROLES[agentName]) {
    return res.status(400).json({
      error: `Invalid agent name: ${agentName}`
    });
  }
  
  try {
    // Update project status
    await updateProjectStatus(projectId, agentName);
    
    // Start the agent processing in the background
    // In a real implementation, we would handle the agent logic here
    // and have the API return immediately while the agent works
    res.json({
      message: `Agent ${agentName} started successfully`,
      projectId,
      agentName
    });
    
    // Execute agent logic asynchronously
    processAgentTask(projectId, agentName);
  } catch (error) {
    next(error);
  }
};

/**
 * Update project status when agent starts
 */
async function updateProjectStatus(projectId, agentName) {
  const agent = AGENT_ROLES[agentName];
  const status = `${agent.name} (${agent.role}) is working...`;
  
  // Log the agent change
  await fileService.appendToLog(projectId, `${agent.name} (${agent.role}) has started working...`);
  
  // Notify clients
  socketService.emitToProject(projectId, 'agentChanged', {
    projectId,
    agent: agentName,
    status
  });
  
  // Update project config
  const fs = require('fs-extra');
  const path = require('path');
  
  const configPath = path.join(__dirname, '../data/projects', projectId, 'config.json');
  const config = await fs.readJson(configPath);
  
  config.currentAgent = agentName;
  config.status = status;
  
  await fs.writeJson(configPath, config, { spaces: 2 });
}

/**
 * Process the agent task asynchronously
 */
async function processAgentTask(projectId, agentName) {
  try {
    // In a real implementation, this would call the Together AI API with the agent's system prompt
    // For this example, we'll simulate some agent behavior
    
    // Simulate agent thinking time
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Create some example files based on the agent
    const agent = AGENT_ROLES[agentName];
    
    if (agentName === 'emma') {
      // PM creates comprehensive PRD
      await fileService.writeFile(
        projectId,
        'docs/PRD.md',
        `# Product Requirements Document\n\nCreated by Emma (Product Manager)\n\n## Project Overview\nComprehensive requirements document for the requested project.\n\n## Target Audience\n- Primary users and their needs\n- User personas and scenarios\n\n## Core Features\n- Feature specifications\n- User stories with acceptance criteria\n- Priority matrix\n\n## Technical Requirements\n- Performance requirements\n- Accessibility standards\n- Browser compatibility\n- Mobile responsiveness\n\n## Success Metrics\n- Key performance indicators\n- User engagement metrics\n- Business objectives`,
        'Emma'
      );
    } else if (agentName === 'bob') {
      // Architect creates comprehensive architecture
      await fileService.writeFile(
        projectId,
        'docs/Architecture.md',
        `# System Architecture Document\n\nCreated by Bob (Software Architect)\n\n## Technology Stack\n- Frontend: React 18+ / HTML5 / CSS3 / JavaScript ES6+\n- Backend: Node.js / Express (if needed)\n- Database: MongoDB / PostgreSQL (if needed)\n- Build Tools: Vite / Webpack\n- Deployment: Netlify / Vercel / AWS\n\n## Project Structure\n\`\`\`\nsrc/\n  components/\n  pages/\n  hooks/\n  utils/\n  styles/\npublic/\ndocs/\n\`\`\`\n\n## Component Architecture\n- Modular component design\n- State management strategy\n- Routing configuration\n- API integration patterns\n\n## Performance Considerations\n- Code splitting\n- Lazy loading\n- Image optimization\n- Caching strategies`,
        'Bob'
      );
    } else if (agentName === 'alex') {
      // Engineer creates production-ready code structure
      await fileService.writeFile(
        projectId,
        'src/App.jsx',
        `import React from 'react';\nimport './App.css';\n\nfunction App() {\n  return (\n    <div className="App">\n      <header className="App-header">\n        <h1>Welcome to Your New Project</h1>\n        <p>Built with modern web technologies</p>\n      </header>\n      <main className="App-main">\n        {/* Main content will be implemented here */}\n      </main>\n      <footer className="App-footer">\n        <p>&copy; 2024 Your Project. All rights reserved.</p>\n      </footer>\n    </div>\n  );\n}\n\nexport default App;`,
        'Alex'
      );

      await fileService.writeFile(
        projectId,
        'src/main.jsx',
        `import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App.jsx';\nimport './index.css';\n\nReactDOM.createRoot(document.getElementById('root')).render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>\n);`,
        'Alex'
      );

      await fileService.writeFile(
        projectId,
        'src/App.css',
        `.App {\n  text-align: center;\n  min-height: 100vh;\n  display: flex;\n  flex-direction: column;\n}\n\n.App-header {\n  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n  padding: 2rem;\n  color: white;\n}\n\n.App-main {\n  flex: 1;\n  padding: 2rem;\n  max-width: 1200px;\n  margin: 0 auto;\n  width: 100%;\n}\n\n.App-footer {\n  background-color: #f8f9fa;\n  padding: 1rem;\n  color: #6c757d;\n}`,
        'Alex'
      );
    } else if (agentName === 'david') {
      // Data Analyst creates data models and API specs
      await fileService.writeFile(
        projectId,
        'docs/DataModels.md',
        `# Data Models & API Specification\n\nCreated by David (Data Analyst)\n\n## Data Models\n\n### User Model\n\`\`\`javascript\n{\n  id: String,\n  email: String,\n  name: String,\n  createdAt: Date,\n  updatedAt: Date\n}\n\`\`\`\n\n## API Endpoints\n\n### GET /api/users\n- Description: Retrieve all users\n- Response: Array of user objects\n\n### POST /api/users\n- Description: Create new user\n- Body: { email, name }\n- Response: Created user object\n\n## Security Considerations\n- Input validation\n- Authentication strategies\n- Data encryption\n- Rate limiting\n\n## Sample Data\nProvided for testing and development purposes.`,
        'David'
      );
    } else if (agentName === 'devops') {
      // DevOps Engineer creates deployment and build configuration
      await fileService.writeFile(
        projectId,
        'package.json',
        `{\n  "name": "project-${projectId}",\n  "private": true,\n  "version": "1.0.0",\n  "type": "module",\n  "scripts": {\n    "dev": "vite",\n    "build": "vite build",\n    "preview": "vite preview",\n    "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0"\n  },\n  "dependencies": {\n    "react": "^18.2.0",\n    "react-dom": "^18.2.0"\n  },\n  "devDependencies": {\n    "@types/react": "^18.2.43",\n    "@types/react-dom": "^18.2.17",\n    "@vitejs/plugin-react": "^4.2.1",\n    "eslint": "^8.55.0",\n    "eslint-plugin-react": "^7.33.2",\n    "eslint-plugin-react-hooks": "^4.6.0",\n    "eslint-plugin-react-refresh": "^0.4.5",\n    "vite": "^5.0.8"\n  }\n}`,
        'DevOps Engineer'
      );

      await fileService.writeFile(
        projectId,
        'vite.config.js',
        `import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\n\nexport default defineConfig({\n  plugins: [react()],\n  build: {\n    outDir: 'dist',\n    sourcemap: true,\n    minify: 'terser',\n    rollupOptions: {\n      output: {\n        manualChunks: {\n          vendor: ['react', 'react-dom']\n        }\n      }\n    }\n  },\n  server: {\n    port: 3000,\n    open: true\n  }\n});`,
        'DevOps Engineer'
      );

      await fileService.writeFile(
        projectId,
        '.env.example',
        `# Environment Variables Template\n# Copy this file to .env and update with your values\n\n# API Configuration\nVITE_API_URL=http://localhost:3001/api\n\n# Third-party Services\nVITE_ANALYTICS_ID=your_analytics_id_here\n\n# Feature Flags\nVITE_ENABLE_ANALYTICS=true\nVITE_ENABLE_PWA=false`,
        'DevOps Engineer'
      );

      await fileService.writeFile(
        projectId,
        'docs/Deployment.md',
        `# Deployment Guide\n\nCreated by DevOps Engineer\n\n## Build Process\n1. \`npm install\` - Install dependencies\n2. \`npm run build\` - Create production build\n3. \`npm run preview\` - Preview production build locally\n\n## Deployment Options\n\n### Netlify (Recommended for Static Sites)\n1. Connect GitHub repository\n2. Set build command: \`npm run build\`\n3. Set publish directory: \`dist\`\n4. Deploy automatically on push\n\n### Vercel (Recommended for React Apps)\n1. Import project from GitHub\n2. Framework preset: Vite\n3. Auto-deploy on push to main branch\n\n## Environment Variables\n- Copy \`.env.example\` to \`.env\`\n- Update with production values\n- Configure in hosting platform\n\n## Performance Optimization\n- Gzip compression enabled\n- Code splitting implemented\n- Image optimization\n- CDN configuration\n\n## Monitoring\n- Error tracking setup\n- Performance monitoring\n- Analytics integration`,
        'DevOps Engineer'
      );
    }
    
    // Mark agent task as completed
    await fileService.appendToLog(projectId, `${agent.name} (${agent.role}) has completed their work`);
    
    // Notify clients
    socketService.emitToProject(projectId, 'agentCompleted', {
      projectId,
      agent: agentName,
      status: `${agent.name} has completed their work`
    });
    
  } catch (error) {
    console.error(`Error in agent ${agentName}:`, error);
    
    // Log the error
    await fileService.appendToLog(projectId, `Error in ${agentName}: ${error.message}`);
    
    // Notify clients
    socketService.emitToProject(projectId, 'agentError', {
      projectId,
      agent: agentName,
      error: error.message
    });
  }
}