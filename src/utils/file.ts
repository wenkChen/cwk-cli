import { merge } from 'lodash'
import { readJsonSync, writeJsonSync } from 'fs-extra'

export const ensureDependenceExist = (name: string, isProduction = false) => {
  return readJsonSync('package.json')[
    `${isProduction ? 'dependencies' : 'devDependencies'}`
  ]?.[name]
}

export const writeIntoPackage = (obj: Record<string, unknown>) => {
  writeJsonSync('package.json', merge(readJsonSync('package.json'), obj))
}
