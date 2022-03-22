import { cyan, redBright, yellowBright, greenBright } from 'chalk'

const log = console.log
export const logDefault = (str: string) => log(greenBright(`[LOGGER]:${str}`))
export const logSuccess = (str: string) => log(cyan(`[SUCCESS]:${str}`))
export const logError = (str: string) => log(redBright(`[ERROR]:${str}`))
export const logWarn = (str: string) => log(yellowBright(`[WARNNING]:${str}`))
