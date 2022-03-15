import inquirer from 'inquirer'
import ora from 'ora'
const options = [
  {
    type: 'list',
    message: '选择框架类型?',
    name: 'type',
    choices: [
      'react',
      'vue',
    ],
  }
]

export default function startCli() {
  const spin = ora('请等待...');
  inquirer
    .prompt(options)
    .then(({ type }) => {
      switch (type) {
        case 'react': {
        }
        default: {
          break
        }
      }
      spin.stop()
    })
    .catch(err => {
      spin.fail(err)
    })
}