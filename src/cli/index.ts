import inquirer from 'inquirer'
import ora from 'ora'
const options = [
  {
    type: 'list',
    message: '选择框架类型?',
    name: 'type',
    choices: ['react', 'vue'],
  },
  {
    type: 'checkbox',
    message: '请选择需要的工程项目?',
    name: 'type',
    choices: ['react', 'vue'],
  },
]

export default async function startCli() {
  const spin = ora('请等待...')
  inquirer
    .prompt(options)
    .then(() => {
      spin.stop()
    })
    .catch((err) => {
      spin.fail(err)
    })
}
