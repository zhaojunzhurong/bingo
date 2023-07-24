'use server'

import { NextApiRequest, NextApiResponse } from 'next'
import { BING_IP, parseCookie, parseUA } from '@/lib/utils'
import { createImage } from '@/lib/bots/bing/utils'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { prompt, id } = req.query
  if (!prompt) {
    return res.json({
      result: {
        value: 'Image',
        message: 'No Prompt'
      }
    })
  }
  const {
    BING_COOKIE = process.env.BING_COOKIE,
    BING_UA = process.env.BING_UA
  } = req.cookies

  const ua = parseUA(decodeURIComponent(BING_UA || '') || req.headers['user-agent'])

  if (!BING_COOKIE) {
    return res.json({
      result: {
        value: 'UnauthorizedRequest',
        message: 'No Cookie'
      }
    })
  }

  const parsedCookie = parseCookie(BING_COOKIE, '_U')
  const headers = {
    'x-forwarded-for': BING_IP,
    'User-Agent': ua!,
    'x-ms-useragent': 'azsdk-js-api-client-factory/1.0.0-beta.1 core-rest-pipeline/1.10.0 OS/Win32',
    cookie: `_U=${parsedCookie}` || '',
  };
  const response = await createImage(String(prompt), String(id), headers)
  res.writeHead(200, {
    'Content-Type': 'text/plain; charset=UTF-8',
  })
  return res.end(response)
}