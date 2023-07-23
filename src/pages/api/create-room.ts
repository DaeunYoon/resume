import axios from 'axios'
import invariant from 'tiny-invariant'

import type { NextApiRequest, NextApiResponse } from 'next'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const apiKey = process.env.NEXT_PUBLIC_HUDDLE_API_KEY
  invariant(apiKey, 'Missing NEXT_PUBLIC_HUDDLE_API_KEY')

  const { title, roomLock } = req.body

  try {
    const { data } = await axios.post(
      'https://us-central1-nfts-apis.cloudfunctions.net/createroom',
      {
        title,
        roomLock,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
      }
    )

    res.status(200).json(data)
  } catch (error) {
    res.status(500).json(error)
  }
}

export default handler
