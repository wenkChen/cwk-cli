import { resolve } from 'path'
import { readdirSync, readFileSync, writeFileSync } from 'fs'
import { merge } from 'lodash'

const PACKAGE_JSON = 'package.json'

export const isFileExistInBaseDir = (name: string | string[], path = '') => {
  const readPath = resolve(path)
  const files = readdirSync(readPath)
  return Array.isArray(name)
    ? name.some((i) => files.includes(i))
    : files.includes(name)
}

export const getJsonToObject = (file = PACKAGE_JSON) => {
  return JSON.parse(readFileSync(file).toString())
}

export const isdepExist = (
  dep: string,
  file = PACKAGE_JSON,
  depName = 'devDependencies'
) => {
  if (isFileExistInBaseDir(file)) {
    const value = getJsonToObject()?.[depName]
    return value?.[dep]
  }
  return false
}

export const writeIntoPackage = (obj: Record<string, unknown>) => {
  const pkg = getJsonToObject()
  writeFileSync(PACKAGE_JSON, JSON.stringify(merge(pkg, obj)))
}
