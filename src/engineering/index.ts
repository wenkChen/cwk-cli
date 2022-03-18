/* eslint-disable no-useless-escape */
import inquirer from 'inquirer'
import ora from 'ora'
import { getJsonToObject, isdepExist, writeIntoPackage } from '../utils/file'
import { resolve } from 'path'
import { readdirSync, writeFileSync } from 'fs'
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
        writeFileSync(
          '.eslintrc.js',
          `/* eslint-disable */
          module.exports = {
            env: {
              browser: true,
              es2021: true,
            },
            extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
            parser: '@typescript-eslint/parser',
            parserOptions: {
              ecmaVersion: 'latest',
              sourceType: 'module',
            },
            plugins: ['@typescript-eslint'],
            rules: {},
          }
          `
        )
        writeIntoPackage({
          'lint-staged': {
            'src/**/*.{js,jsx,ts,tsx,json,css}': ['eslint --fix src/'],
          },
        })
      },
      commitlint: () => {
        !isdepExist('@commitlint/cli') &&
          execSync(`npm install @commitlint/cli --save-dev`)

        !isdepExist('@commitlint/config-conventional') &&
          execSync(`npm install @commitlint/config-conventional --save-dev`)

        execSync(
          'npx husky install && npx husky add .husky/commit-msg "npx commitlint --edit $1"'
        )
        writeFileSync(
          'commintlint.config.js',
          `
        /* eslint-disable */
        module.exports = {
          extends: ['@commitlint/config-conventional'],
          parserPreset: {
            parserOpts: {
              headerPattern: /^(\w*)(?:\((.*)\))?:[ ]?(.*)$/,
              headerCorrespondence: ['type', 'scope', 'subject'],
            },
          },
          rules: {
            'type-empty': [2, 'never'],
            'type-case': [2, 'always', 'lower-case'],
            'subject-empty': [2, 'never'],
            'type-enum': [
              2,
              'always',
              ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore'],
            ],
          },
        }`
        )
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
        execSync('npx prettier --write src/**')
        writeFileSync(
          '.prettierrc.js',
          `
        module.exports = {
          trailingComma: 'es5', // 在对象或数组最后一个元素后面是否加逗号（在ES5中加尾逗号）
          useTabs: false, //使用空格代替tab缩进
          tabWidth: 2, // 缩进长度
          semi: false, // 句末使用分号
          singleQuote: true, // 单引号（JSX会忽略这个配置）
          jsxSingleQuote: true, // jsx中使用单引号
          arrowParens: 'always', //单参数箭头函数参数周围使用圆括号-eg: (x) => x
        }  `
        )
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
        }
      } catch (e) {
        console.log('e', e)
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
