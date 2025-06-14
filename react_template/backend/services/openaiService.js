// backend/services/togetherService.js
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

// Initialize Together AI client configuration
const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY || '547badb7bc1232e7e93b8f9ba15119200cd3b660c8f3fbd0c050b86797910c64';
const TOGETHER_BASE_URL = 'https://api.together.xyz/v1';

// Create axios instance for Together AI API
const togetherClient = axios.create({
  baseURL: TOGETHER_BASE_URL,
  headers: {
    'Authorization': `Bearer ${TOGETHER_API_KEY}`,
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 seconds timeout
});

// Check if client is properly configured
let clientInitialized = false;
try {
  if (TOGETHER_API_KEY && TOGETHER_API_KEY !== 'your_together_api_key_here') {
    clientInitialized = true;
  } else {
    console.error('Together AI API key not properly configured');
  }
} catch (error) {
  console.error('Error initializing Together AI client:', error);
}

/**
 * Execute a request to Together AI API
 * @param {string} systemPrompt - The system prompt to use
 * @param {string} userPrompt - The user prompt to use
 * @param {object} options - Additional options like temperature
 * @returns {Promise<string>} - The response from Together AI
 */
exports.executePrompt = async (systemPrompt, userPrompt, options = {}) => {
  if (!clientInitialized) {
    throw new Error('Together AI client not initialized. Check your API key.');
  }

  try {
    const messages = [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: userPrompt,
      },
    ];

    // Map OpenAI models to Together AI serverless models
    const modelMapping = {
      'gpt-4': 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
      'gpt-3.5-turbo': 'mistralai/Mistral-7B-Instruct-v0.3',
    };

    const model = modelMapping[options.model] || options.model || 'mistralai/Mistral-7B-Instruct-v0.3';

    const requestData = {
      model: model,
      messages: messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 2048,
    };

    const response = await togetherClient.post('/chat/completions', requestData);

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error executing Together AI prompt:', error);
    const errorMessage = error.response?.data?.error?.message || error.message;
    throw new Error(`Together AI API error: ${errorMessage}`);
  }
};

/**
 * Get agent system prompt based on agent role and project context
 * @param {string} agentRole - The role of the agent (pm, architect, engineer, etc.)
 * @param {object} projectContext - Context information about the project
 * @returns {string} - The system prompt for the agent
 */
exports.getAgentSystemPrompt = (agentRole, projectContext) => {
  const rolePrompts = {
    emma: `You are Emma, a Product Manager specializing in web applications.
    Create a comprehensive Product Requirements Document (PRD) for: ${projectContext.userPrompt}.

    Consider these website types as reference: Personal Portfolio, Weather App, To-Do List, Landing Page, E-Commerce Catalog, Blog, Calculator, Quiz App, Music Player, Image Gallery, Clock/Timer, Recipe App, Color Picker, Typing Speed Test, Login/Register Interface.

    Your PRD should include:
    - Project Overview & Target Audience
    - Core Features & User Stories
    - Technical Requirements (responsive design, accessibility, performance)
    - UI/UX Specifications
    - Content Strategy
    - Success Metrics
    - Out of Scope Items

    Format your response in Markdown with clear sections.`,

    bob: `You are Bob, a Software Architect specializing in modern web development.
    Design the complete technical architecture for: ${projectContext.userPrompt}.

    Your architecture should support building deployable universal websites including static sites, SPAs, and full-stack applications.

    Include:
    - Technology Stack (Frontend: React/HTML/CSS/JS, Backend: Node.js if needed, Database: appropriate choice)
    - Project Structure & File Organization
    - Component Architecture (if React-based)
    - API Design (if backend needed)
    - Database Schema (if data persistence required)
    - Third-party Integrations (APIs, libraries)
    - Performance Considerations
    - Security Architecture

    Format your response in Markdown with detailed technical specifications.`,

    alex: `You are Alex, a Full-Stack Software Engineer.
    Implement the complete codebase for: ${projectContext.userPrompt}.

    Create production-ready code that includes:
    - Frontend implementation (HTML/CSS/JavaScript or React components)
    - Backend API endpoints (if required)
    - Database models and schemas (if needed)
    - Responsive design and mobile optimization
    - Error handling and validation
    - Clean, well-documented code following best practices
    - Accessibility features (ARIA labels, semantic HTML)
    - Performance optimizations

    Provide actual code files with proper structure and naming conventions.`,

    david: `You are David, a Data Analyst and Backend Specialist.
    Design the complete data architecture for: ${projectContext.userPrompt}.

    Include:
    - Data Models & Entity Relationships
    - Database Schema (SQL/NoSQL as appropriate)
    - API Endpoints & Request/Response formats
    - Data Validation Rules
    - Security & Authentication strategies
    - Sample Data Sets for testing
    - Data Flow Diagrams
    - Performance optimization strategies
    - Backup & Recovery considerations

    Format your response in Markdown with code examples and schemas.`,

    devops: `You are a DevOps Engineer specializing in web deployment and automation.
    Create the complete deployment and build configuration for: ${projectContext.userPrompt}.

    Provide:
    - Build Configuration (package.json, build scripts, bundler setup)
    - Environment Configuration (.env files, config management)
    - CI/CD Pipeline (GitHub Actions, deployment workflows)
    - Deployment Setup (Netlify, Vercel, or appropriate hosting)
    - Performance Optimization (minification, compression, caching)
    - Monitoring & Analytics setup
    - Domain & SSL configuration
    - Backup & Recovery procedures
    - Documentation for deployment process

    Include actual configuration files and step-by-step deployment instructions.`,
  };

  return rolePrompts[agentRole] || 'You are an AI assistant helping with a software project.';
};

/**
 * Stream agent responses
 * @param {string} systemPrompt - The system prompt to use
 * @param {string} userPrompt - The user prompt to use
 * @param {function} onChunk - Callback for each chunk of the response
 * @param {object} options - Additional options
 */
exports.streamResponse = async (systemPrompt, userPrompt, onChunk, options = {}) => {
  if (!clientInitialized) {
    throw new Error('Together AI client not initialized. Check your API key.');
  }

  try {
    const messages = [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: userPrompt,
      },
    ];

    // Map OpenAI models to Together AI serverless models
    const modelMapping = {
      'gpt-4': 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
      'gpt-3.5-turbo': 'mistralai/Mistral-7B-Instruct-v0.3',
    };

    const model = modelMapping[options.model] || options.model || 'mistralai/Mistral-7B-Instruct-v0.3';

    const requestData = {
      model: model,
      messages: messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 2048,
      stream: true,
    };

    const response = await togetherClient.post('/chat/completions', requestData, {
      responseType: 'stream'
    });

    // Process the streaming response
    response.data.on('data', (chunk) => {
      try {
        const lines = chunk.toString().split('\n').filter(line => line.trim() !== '');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              return;
            }
            const parsedChunk = JSON.parse(data);
            if (parsedChunk.choices && parsedChunk.choices[0].delta && parsedChunk.choices[0].delta.content) {
              onChunk(parsedChunk.choices[0].delta.content);
            }
          }
        }
      } catch (error) {
        console.error('Error parsing stream chunk:', error);
      }
    });
  } catch (error) {
    console.error('Error in Together AI stream:', error);
    const errorMessage = error.response?.data?.error?.message || error.message;
    throw new Error(`Together AI API error: ${errorMessage}`);
  }
};