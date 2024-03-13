import { getNewRefreshToken, getNewUrl, getAccessTOken } from '../lib/google_auth'
import { handleMessage } from './bot'
import { Request } from 'express'
import { createSpreadsheet } from './googleSheet'
export const handler = async (req: Request, method?: string) => {
  try {
    if (method === 'GET') {
      if (req.url === '/test') {
        const data = await getNewUrl()
        const parseUrl = data.config.url?.replace(/\s/g, '')
        return parseUrl
      }
      if (req.url.indexOf('/gtoken') > -1) {
        const data = req.query
        const refreshtoken = await getNewRefreshToken(data.code)
        const refresh_token = refreshtoken.data.refresh_token
        return refresh_token
      }
      if (req.url === '/get-access-token') {
        const refreshtoken = ''
        const accessTokenData = await getAccessTOken(refreshtoken)
        return accessTokenData.data
      }
      if (req.url === '/speadsheet') {
        const access_token = ''
        // const spreadsheetId = "15EU70BC_";
        const sheetName = 'test_spsheet'
        const data = await createSpreadsheet(sheetName, access_token)
        console.log('readSheetValues---------->', JSON.stringify(data, null, 2))
        return JSON.stringify(data, null, 2)
      }
      return 'unknown get'
    }
    const body = req.body

    if (body) {
      const messageObject = body.message
      await handleMessage(messageObject)
    }
    return
  } catch (error) {
    console.error('Error message from handler function:', error)
  }
}
