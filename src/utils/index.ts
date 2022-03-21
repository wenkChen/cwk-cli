import { exec } from 'shelljs'
import ora from 'ora'
export const npmInstall = (name: string, isProduction = false) => {
  const spin = ora(`downloading ${name}...`).start()
  try {
    exec(`npm i ${name} ${isProduction ? '--save' : '--save-dev'}`)
    spin.succeed()
  } catch (err) {
    spin.fail(`${err}`)
  }
}
