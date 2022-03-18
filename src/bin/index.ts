#!/usr/bin/env node
import { Command } from 'commander'
import getTranslate from '../translate'
import getEngineering from '../engineering'
import { command, version } from '../../package.json'
import startCli from '../cli'
const program = new Command(command)

const commandConfig = [
  {
    description: '脚手架',
    command: 'cli',
    alias: 'c',
    action: () => startCli(),
  },
  {
    description: '翻译',
    command: 'translate <content> [target]',
    alias: 't',
    action: (text: string, target: string) => {
      return getTranslate({
        text,
        from: 'auto',
        to: target || 'en',
      })
    },
  },
  {
    description: '工程化',
    command: 'engineering',
    alias: 'e',
    action: () => getEngineering(),
  },
]

program
  .version(version)
  .option('-c, --cli', '选择脚手架模版')
  .option('-t, --translate <content> [target]', '翻译内容')

commandConfig.forEach((config) => {
  const { description, command, action, alias } = config
  program.description(description).command(command).alias(alias).action(action)
})

if (!process.argv[2]) program.help()
program.parse(process.argv)
