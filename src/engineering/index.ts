/* eslint-disable no-useless-escape */
import inquirer from 'inquirer'
import { ensureDependenceExist, writeIntoPackage } from '../utils/file'
import { resolve } from 'path'
import { readdirSync } from 'fs'
import { exec } from 'shelljs'
import { npmInstall } from '../utils'

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
    baseDeps.forEach(async ({ name, afterInstall, checkInstalled }) => {
      const depInstalled = checkInstalled()
      if (await !depInstalled) {
        npmInstall(name)
        afterInstall()
      }
    })
    // 根据选项写入lint-stage
    const stageCommandMap = {
      eslint: () => {
        npmInstall('eslint')
        writeIntoPackage({
          'lint-staged': {
            'src/**/*.{js,jsx,ts,tsx,json,css}': ['eslint --fix src/'],
          },
        })
      },
      commitlint: () => {
        !ensureDependenceExist('@commitlint/cli') &&
          npmInstall('@commitlint/cli')

        !ensureDependenceExist('@commitlint/config-conventional') &&
          npmInstall('@commitlint/config-conventional')

        exec(
          'npx husky install && npx husky add .husky/commit-msg "npx commitlint --edit $1"'
        )
      },
      prettier: () => {
        npmInstall(`prettier`)
        writeIntoPackage({
          'lint-staged': {
            'src/**/*.{js,jsx,ts,tsx,json,css}': [
              'prettier --write',
              'git add',
            ],
            '*.{md,json,css}': ['prettier --write', 'git add'],
          },
        })
        exec('npx prettier --write "package.json"')
      },
    }

    // 检查配置文件
    const files = readdirSync(resolve(''))
    options.forEach((item) => {
      try {
        stageCommandMap[item]()
        // eslint-disable-next-line no-useless-escape
        const patt = new RegExp(`(\.)?${item}(\.config)?(\.)?[a-z]*`)
        const isExist = files.some((i) => patt.test(i))
        if (isExist) {
          console.log(`${item}已存在独立配置文件`)
        } else {
          // 下载仓库的对应配置文件
        }
      } catch (e) {
        console.log('e', e)
      }
    })
  } catch (e) {
    console.log('e', e)
  }
}

export default async function main() {
  inquirer
    .prompt(options)
    .then(({ options }) => {
      startEngineering(options)
    })
    .catch((err) => {
      console.warn(err)
    })
}
