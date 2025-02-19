import * as core from '@actions/core';
import * as dotenv from 'dotenv';
import * as dotenvExpand from 'dotenv-expand';
import { promises as fs } from 'fs';
import * as path from 'path';

// Function to generate .env file path
const generatePathToFile = (folder: string, mode?: string): string =>
  path.join(folder, `.env${mode ? `.${mode}` : ''}`);

// Function to parse JSON string into .env format
const convertJsonToEnv = (jsonString: string): string => {
  try {
    const jsonObject = JSON.parse(jsonString);
    return Object.entries(jsonObject)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
  } catch (error) {
    throw new Error(`Invalid JSON format: ${error.message}`);
  }
};

// Function to write .env file
const writeEnvFile = async (filePath: string, content: string): Promise<void> => {
  try {
    await fs.writeFile(filePath, content, 'utf8');
  } catch (error) {
    throw new Error(`Failed to write .env file: ${error.message}`);
  }
};

// Function to read existing .env file
const readFile = async (filePath: string, loadMode: 'strict' | 'skip'): Promise<string> => {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch (error) {
    if (loadMode === 'skip') return '';
    throw error;
  }
};

// Function to parse and expand .env variables
const parseEnv = (content: string): Record<string, string> => {
  const parsed = dotenv.parse(content);
  return dotenvExpand.expand({ parsed, ignoreProcessEnv: false }).parsed || {};
};

// Function to export environment variables
const exportEnvVariables = (env: Record<string, string>): void => {
  Object.entries(env).forEach(([key, value]) => core.exportVariable(key, value));
};

// Main function
const main = async (): Promise<void> => {
  try {
    const pathToFolder = core.getInput('path')?.trim() || '.';
    const mode = core.getInput('mode')?.trim() || '';
    const loadMode = (core.getInput('load-mode')?.trim() as 'strict' | 'skip') || 'strict';
    const jsonSecret = core.getInput('json-secret')?.trim(); // New input for JSON secret

    const filePath = generatePathToFile(pathToFolder, mode);
    let content = '';

    // If JSON secret is provided, convert it to .env format
    if (jsonSecret) {
      content = convertJsonToEnv(jsonSecret);
      await writeEnvFile(filePath, content);
      core.info(`.env file created from JSON secret: ${filePath}`);
    } else {
      // Otherwise, read the existing .env file
      content = await readFile(filePath, loadMode);
    }

    // Parse and load environment variables
    const env = parseEnv(content);
    exportEnvVariables(env);
  } catch (error) {
    core.setFailed(error instanceof Error ? error.message : String(error));
  }
};

main();