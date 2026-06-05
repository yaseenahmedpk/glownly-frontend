# AI Agents Reference

This document provides a reference to AI agents used or referenced in the BarberWebApp-frontend project.

## Available Agents (from Kilo)

The project utilizes [Kilo](https://kilo.ai/) as an AI-powered software engineering assistant. Kilo provides various specialized agents for different tasks. For a complete list of available agents, refer to the [Kilo documentation](https://kilo.ai/docs).

## Project-Specific Agent Guidelines

When working with AI agents in this project, follow these guidelines:

1. **Context Awareness**: Agents should be provided with relevant project context, including:
   - File paths and structures
   - Existing code patterns and conventions
   - Configuration files (package.json, vite.config.js, etc.)
   - Related services and components

2. **Task Definition**: Clearly define the task for the agent, including:
   - Specific files to modify
   - Expected outcomes
   - Any constraints or requirements

3. **Validation**: After agent execution, always:
   - Review the changes made
   - Run linting and type checking (if applicable)
   - Verify functionality aligns with requirements

## Common Agent Usage Patterns

### Code Modification
When requesting code changes:
- Specify the exact file path
- Describe the change in detail
- Indicate if new files should be created
- Note any dependencies that might be affected

### File Operations
For file-related tasks:
- Use absolute paths from the project root
- Clarify if files should be read, written, or edited
- Specify encoding or format requirements when relevant

### Dependency Management
When modifying dependencies:
- Clearly state which packages to add/remove/update
- Specify versions if required
- Note if the change affects both frontend and backend (though this is frontend-only)

## Example Agent Interaction

```
User: Update the HomeView.vue to use VueDatePicker with a submit button and remove moment/daterangepicker dependencies.

Agent: [Would process this request by:
  1. Reading package.json to identify dependencies
  2. Reading HomeView.vue to understand current implementation
  3. Editing package.json to remove moment and daterangepicker
  4. Editing HomeView.vue to implement VueDatePicker with submit button
  5. Verifying the changes]
```

## Maintenance

This document should be updated as:
- New agent capabilities are discovered or utilized
- Project-specific agent workflows are established
- Changes are made to how agents interact with the project