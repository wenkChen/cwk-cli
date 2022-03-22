/* eslint-disable no-useless-escape */
import inquirer from 'inquirer'
import { ensureDependenceExist, writeIntoPackage } from '../utils/file'
import { readdirSync } from 'fs'
import { exec } from 'shelljs'
import { downloadGitRepo, npmInstall } from '../utils'
import { logError } from '../utils/log'

const baseDeps = [
  {
    name: 'husky',
    afterInstall: () => {
      exec('npx husky install')
    },
    checkInstalled: () =>
      Boolean(ensureDependenceExist('husky') && readdirSync('.husky')),
  },
  {
    name: 'lint-staged',
    afterInstall: () => {
      exec('npx husky add .husky/pre-commit "npx lint-staged --allow-empty $1"')
    },
    checkInstalled: () => Boolean(ensureDependenceExist('lint-staged')),
  },
]

const config = ['eslint', 'commitlint', 'prettier']
const options = [
  {
    type: 'checkbox',
    message: '请选择需要的工程规范?',
    name: 'options',
    default: config,
    choices: config,
  },
]

const startEngineering = (
  options: Array<'eslint' | 'commitlint' | 'prettier'>
) => {
  try {
    baseDeps.forEach(({ name, afterInstall, checkInstalled }) => {
      const depInstalled = checkInstalled()
      if (!depInstalled) {
        npmInstall(name)
        afterInstall()
      }
    })

    const installAndConfig = {
      eslint: {
        depends: ['eslint'],
        configFile: ['.eslintrc.js'],
        afterInstall: () => {
          writeIntoPackage({
            'lint-staged': {
              'src/**/*.{js,jsx,ts,tsx,json,css}': ['eslint --fix src/'],
            },
          })
        },
      },
      commitlint: {
        depends: ['@commitlint/cli', '@commitlint/config-conventional'],
        configFile: ['commitlint.config.js'],
        afterInstall: () => {
          exec(
            'npx husky install && npx husky add .husky/commit-msg "npx commitlint --edit $1"'
          )
        },
      },
      prettier: {
        depends: ['prettier'],
        configFile: ['.prettierrc', '.prettierigonre'],
        afterInstall: () => {
          writeIntoPackage({
            'lint-staged': {
              'src/**/*.{js,jsx,ts,tsx,json,css}': [
                'prettier --write',
                'git add',
              ],
              '*.{md,json,css}': ['prettier --write', 'git add'],
            },
          })
        },
      },
    }
    // 下载配置文件
    options.forEach((item) => {
      const plugin = installAndConfig[item]
      plugin.depends.forEach((i) => !ensureDependenceExist && npmInstall(i))
      plugin.afterInstall()
      plugin.configFile.forEach(() => downloadGitRepo(item))
    })
  } catch (err) {
    logError(`${err}`)
  }
}

export default async function main() {
  inquirer
    .prompt(options)
    .then(({ options }) => {
      startEngineering(options)
    })
    .catch((err) => {
      logError(err)
    })
}
