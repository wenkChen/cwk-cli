import { exec } from 'shelljs'
import downloadGit from 'download-git-repo'
import { logError, logSuccess } from './log'
import config from '../config'
import { removeSync, rename } from 'fs-extra'
import { existsSync, readdirSync } from 'fs'

export const npmInstall = async (name: string, isProduction = false) => {
  try {
    await exec(`npm i ${name} ${isProduction ? '--save' : '--save-dev'}`)
  } catch (err) {
    logError(`${err}`)
  }
}

export const downloadGitRepo = async (
  dirName: string,
  onlyFiles?: boolean,
  path?: string
) => {
  const getOnlyFiles = () => {
    try {
      if (onlyFiles && existsSync(dirName)) {
        const files = readdirSync(dirName)
        files.forEach((i) => rename(`${dirName}/${i}`, process.cwd() + '/' + i))
        removeSync(dirName)
      }
    } catch (error) {
      logError(`${error}`)
    }
  }

  if (!existsSync(dirName)) {
    await downloadGit(
      `${config.registry}/${dirName}`,
      process.cwd() + `${path ? '/' + path : ''}`,
      (err: string) => {
        err ? logError('Download failed') : logSuccess(`Download completed`)
      }
    )
    getOnlyFiles()
  } else {
    logError(`目录${dirName}存在`)
    getOnlyFiles()
  }
}
