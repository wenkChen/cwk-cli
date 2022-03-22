import { exec } from 'shelljs'
import downloadGit from 'download-git-repo'
import { logError, logSuccess } from './log'
import config from '../config'

export const npmInstall = async (name: string, isProduction = false) => {
  try {
    await exec(`npm i ${name} ${isProduction ? '--save' : '--save-dev'}`)
  } catch (err) {
    logError(`${err}`)
  }
}

export const downloadGitRepo = async (fileName: string, path?: string) => {
  await downloadGit(
    `${config.registry}/${fileName}`,
    process.cwd() + `${path ? '/' + path : ''}`,
    { clone: true },
    (err: string) => {
      err ? logError('Download failed') : logSuccess(`Download completed`)
    }
  )
}
