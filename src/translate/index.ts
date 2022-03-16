import ora from 'ora'
import request from '../utils/request'
import md5 from 'md5'
import { appid, secretKey, API } from './config'

interface optType {
  text: string
  from: string
  to: string
}
const defaultOpts = {
  text: '',
  from: 'zh',
  to: 'en',
}

const getTranslate = async (opts: optType = defaultOpts) => {
  const spin = ora('正在翻译...').start()
  try {
    if (!opts.text.trim()) {
      spin.fail('不能输入空的内容！')
    }
    const salt = `${Math.random() * 1000}`
    const sign = md5(
      Object.values({
        appid,
        q: opts.text,
        salt,
        secretKey,
      }).join('')
    )
    const res = await request.get(API, {
      params: {
        q: opts.text,
        from: opts.from,
        to: opts.to,
        appid,
        salt,
        sign,
      },
    })
    const key = JSON.stringify(res.data['trans_result'][0]['src'])
    const value = JSON.stringify(res.data['trans_result'][0]['dst'])
    spin.succeed(`${key}:${value}`)
  } catch (err) {
    spin.fail(`${err}`)
  } finally {
    process.exit(1)
  }
}

export default getTranslate
