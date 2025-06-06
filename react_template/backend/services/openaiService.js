// backend/services/openaiService.js
const { Configuration, OpenAIApi } = require('openai');
const dotenv = require('dotenv');

dotenv.config();

// Initialize OpenAI client
let openai;

try {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  openai = new OpenAIApi(configuration);
} catch (error) {
  console.error('Error initializing OpenAI client:', error);
  openai = null;
}

/**
 * Execute a request to OpenAI API
 * @param {string} systemPrompt - The system prompt to use
 * @param {string} userPrompt - The user prompt to use
 * @param {object} options - Additional options like temperature
 * @returns {Promise<string>} - The response from OpenAI
 */
exports.executePrompt = async (systemPrompt, userPrompt, options = {}) => {
  if (!openai) {
    throw new Error('OpenAI client not initialized. Check your API key.');
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

    const response = await openai.createChatCompletion({
      model: options.model || 'gpt-4',
      messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 2048,
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error executing OpenAI prompt:', error);
    throw new Error(`OpenAI API error: ${error.message}`);
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
    pm: `You are Emma, a Product Manager. 
    Your task is to create a comprehensive Product Requirements Document (PRD) for the following project: ${projectContext.userPrompt}.
    The PRD should include:
    - Project Overview
    - User Stories
    - Features and Requirements
    - Acceptance Criteria
    - Out of Scope
    Format your response in Markdown.`,

    architect: `You are Bob, a Software Architect. 
    Based on the PRD, design the architecture for: ${projectContext.userPrompt}.
    Include:
    - Technology Stack recommendations
    - System Architecture diagram (in text form)
    - API Endpoints
    - Database Schema
    Format your response in Markdown.`,

    engineer: `You are Alex, a Software Engineer.
    Implement the code for this project based on the architecture and PRD: ${projectContext.userPrompt}.
    Focus on:
    - Clean, well-structured code
    - Following best practices
    - Creating necessary files for the project`,

    dataAnalyst: `You are David, a Data Analyst.
    Design data models and security rules for: ${projectContext.userPrompt}.
    Include:
    - Data models and relationships
    - Security rules and permissions
    - Sample data schemas
    Format your response in Markdown.`,

    teamLead: `You are Mike, a Team Lead.
    Review the entire project and create documentation for: ${projectContext.userPrompt}.
    Include:
    - Code review notes
    - Implementation suggestions
    - Final documentation
    Format your response in Markdown.`,
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
  if (!openai) {
    throw new Error('OpenAI client not initialized. Check your API key.');
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

    const response = await openai.createChatCompletion({
      model: options.model || 'gpt-4',
      messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 2048,
      stream: true,
    }, { responseType: 'stream' });

    // Process the streaming response
    for await (const chunk of response.data) {
      try {
        const parsedChunk = JSON.parse(chunk.toString().trim().substring(6));
        if (parsedChunk.choices && parsedChunk.choices[0].delta.content) {
          onChunk(parsedChunk.choices[0].delta.content);
        }
      } catch (error) {
        console.error('Error parsing stream chunk:', error);
      }
    }
  } catch (error) {
    console.error('Error in OpenAI stream:', error);
    throw new Error(`OpenAI API error: ${error.message}`);
  }
};