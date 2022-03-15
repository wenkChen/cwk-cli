#! node
import { Command } from 'commander'
import getTranslate from '../translate'
import { command, version } from '../../package.json'
import startCli from '../cli'
const program = new Command(command)

const commandConfig = [
  {
    description: "脚手架",
    command: 'cli',
    alias: '',
    action: () => startCli()
  },
  {
    description: "翻译",
    command: 'translate <content>',
    arg: '<content>',
    alias: "t",
    action: (text: string) => getTranslate({
      text,
      from: 'zh',
      to: 'en'
    })
  }
]

program.version(version)


commandConfig.forEach(config => {
  const { description, command, action, arg, alias } = config
  program
    .description(description)
    .command(command)
    .alias(alias)
    .action((value) => {
      action(value)
    })
})

if (!process.argv[2]) program.help()
program.parse(process.argv)