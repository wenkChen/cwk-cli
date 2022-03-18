import inquirer from 'inquirer'
import ora from 'ora'
import { getJsonToObject, isdepExist, writeIntoPackage } from '../utils/file'
import { resolve } from 'path'
import { readdirSync } from 'fs'
import { execSync } from 'child_process'

const baseDeps = [
  {
    name: 'husky',
    install: () => {
      execSync('npm i husky --save-dev ')
      execSync('npx husky install ')
    },
    checkInstalled: () => Boolean(isdepExist('husky') && readdirSync('.husky')),
  },
  {
    name: 'lint-staged',
    install: () => {
      execSync('npm i lint-staged --save-dev')
      execSync(
        'npx husky add .husky/pre-commit "npx lint-staged --allow-empty $1"'
      )
    },
    checkInstalled: () =>
      Boolean(isdepExist('lint-staged') && getJsonToObject()['lint-staged']),
  },
]

const startEngineering = (
  options: Array<'eslint' | 'commitlint' | 'prettier'>
) => {
  try {
    baseDeps.forEach(async ({ name, install, checkInstalled }) => {
      const depInstalled = checkInstalled()
      const spinner = ora(`配置${name}中...`).start()
      ;(await !depInstalled) && install()
      spinner.succeed(`配置${name}完成!`).stop()
    })
    // 根据选项写入lint-stage
    const stageCommandMap = {
      eslint: () => {
        execSync(`npm i eslint --save-dev`)
        writeIntoPackage({
          'lint-staged': {
            'src/**/*.{js,jsx,ts,tsx,json,css}': ['eslint --fix src/'],
          },
        })
      },
      commitlint: () => {
        console.log(
          '执行了commitlint',
          !isdepExist('@commitlint/cli'),
          !isdepExist('@commitlint/config-conventional')
        )
        !isdepExist('@commitlint/cli') &&
          execSync(`npm install @commitlint/cli --save-dev`)
        !isdepExist('@commitlint/config-conventional') &&
          execSync(`npm install @commitlint/config-conventional --save-dev`)
        execSync('npx husky add .husky/commit-msg "npx commitlint --edit $1"')
      },
      prettier: () => {
        execSync(`npm i prettier -D`)
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
    }

    // 检查配置文件
    const files = readdirSync(resolve(''))
    options.forEach((item) => {
      stageCommandMap[item]()
      // eslint-disable-next-line no-useless-escape
      const patt = new RegExp(`(\.)?${item}(\.config)?(\.)?[a-z]*`)
      const isExist = files.some((i) => patt.test(i))
      if (isExist) {
        console.log(`${item}已存在独立配置文件`)
      }
    })
  } catch (e) {
    console.log('e', e)
  }
}

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
