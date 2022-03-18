import inquirer from 'inquirer'
import ora from 'ora'
import {
  getJsonToObject,
  isdepExist,
  isFileExistInBaseDir,
  writeIntoPackage,
} from '../utils/file'
import { resolve } from 'path'
import { readdirSync } from 'fs'
import { exec } from 'child_process'

const baseDeps = [
  {
    name: 'husky',
    install: () => exec('npm i husky --save-dev && npx husky install'),
    checkInstalled: () => {
      const isInstalled = Boolean(isdepExist('husky') && readdirSync('.husky'))
      console.log(`husky ${isInstalled ? '已' : '未'}安装`)
      return isInstalled
    },
  },
  {
    name: 'lint-staged',
    install: () => {
      exec('npm i lint-staged --save-dev')
      exec('npx husky add .husky/pre-commit `npx lint-staged --allow-empty $1`')
    },
    checkInstalled: () => {
      const isInstalled = Boolean(
        isdepExist('lint-staged') && getJsonToObject()['lint-staged']
      )
      return isInstalled
    },
  },
]

const startEngineering = (
  options: Array<'eslint' | 'commitlint' | 'prettier'>
) => {
  try {
    baseDeps.forEach(async ({ name, install, checkInstalled }) => {
      const depInstalled = checkInstalled()
      const spinner = ora(
        depInstalled ? `检查${name}是否安装...` : `开始安装:${name}...`
      ).start()
      ;(await !depInstalled) && install()
      spinner
        .succeed(depInstalled ? `${name}已安装！` : `安装${name}完成!`)
        .stop()
    })
    // 根据选项写入lint-stage
    const stageCommandMap = {
      eslint: () => {
        exec(`npm i eslint --save-dev`)
        writeIntoPackage({
          'lint-staged': { '*.{js,ts}': 'eslint --fix' },
        })
      },
      commitlint: () => {
        if (
          !isdepExist('@commitlint/cli') &&
          !isdepExist('@commitlint/config-conventional')
        ) {
          exec(
            `npm install @commitlint/config-conventional @commitlint/cli --save-dev`
          )
        }
        exec(
          'npx husky add .husky/commit-msg `npx --no-install commitlint --edit $1`'
        )
        return {}
      },
      prettier: () => {
        exec(`npm i prettier -D`)
        writeIntoPackage({
          'lint-staged': { '*.{js,ts,jsx,tsx,json}': 'prettier --write .' },
        })
      },
    }

    // 检查配置文件
    const files = readdirSync(resolve(''))
    options.forEach((item) => {
      stageCommandMap[item]()
      // eslint-disable-next-line no-useless-escape
      const patt = new RegExp(`(\.)?${item}(\.config)?(\.)?[a-z]*`)
      const isExist = files.some((i) => patt.test(i))
      console.log('isExist', isExist)
    })
  } catch (e) {
    console.log('e', e)
  }
}

const options = [
  {
    type: 'checkbox',
    message: '请选择需要的工程规范?',
    name: 'options',
    choices: ['eslint', 'commitlint', 'prettier'],
  },
]

export default async function main() {
  const spin = ora('请等待...')
  inquirer
    .prompt(options)
    .then(({ options }) => {
      startEngineering(options)
      spin.stop()
    })
    .catch((err) => {
      spin.fail(err)
    })
}
