import * as core from '@actions/core'
import * as dotenv from 'dotenv'
import * as dotenvExpand from 'dotenv-expand'
import { promises as fs } from 'fs'
import * as path from 'path'
import { IInput } from './interfaces'

const generatePathToFile = (folder: string, mode?: string): string =>
  path.join(folder, `myenv${mode ? `.${mode}` : ''}`)

const readFile = async (filePath: string, loadMode: 'strict' | 'skip'): Promise<string> => {
  try {
    return await fs.readFile(filePath, 'utf8')
  } catch (error) {
    if (loadMode === 'skip') return ''
    throw error
  }
}

const parseEnv = (content: string): Record<string, string> =>
  dotenvExpand.expand({ parsed: dotenv.parse(content) }).parsed || {}

const exportEnvVariables = (env: Record<string, string>): void =>
  Object.entries(env).forEach(([key, value]) => core.exportVariable(key, value))

const main = async (): Promise<void> => {
  try {
    const input: IInput = {
      pathToFolder: core.getInput('path')?.trim() || '.',  // Always a valid string
      mode: core.getInput('mode')?.trim() || '', // Always a valid string
      loadMode: (core.getInput('load-mode')?.trim() as 'strict' | 'skip') || 'strict', // Always 'strict' or 'skip'
    }

    const filePath = generatePathToFile(input.pathToFolder, input.mode) // Now always valid
    const content = await readFile(filePath, input.loadMode) // Now always valid
    const env = parseEnv(content)
    exportEnvVariables(env)
  } catch (error) {
    core.setFailed(error instanceof Error ? error.message : String(error))
  }
}

main()
