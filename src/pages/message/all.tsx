import { Client } from '@xmtp/xmtp-js'
import { ethers } from 'ethers'
import { useEffect, useState, useRef } from 'react'
import Chat from '~/components/Chat'
import { Button } from 'antd'
import Link from 'next/link'
import { useXmtpClient } from '~/stores/xmtpClient'
import { useAccount } from 'wagmi'

export default function Home() {
  const { address } = useAccount()
  const { setClient } = useXmtpClient()
  const { isConnected, isOnNetwork, xmtpClient } = useXmtpClient(
    (state) => state.state
  )
  const [isLoading, setIsLoading] = useState(false)

  const [conversations, setConversations] = useState([])

  const loadConversations = async function (xmtp_client) {
    const conversations = await xmtp_client.conversations.list()
    setConversations(conversations)
  }

  // TODO: useLocalStore to save xmtp client, reset it when walletaddress changes
  // Function to initialize the XMTP client
  const initXmtp = async function () {
    try {
      setIsLoading(true)
      await loadConversations(xmtpClient)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (xmtpClient?.address !== address) {
      setClient()
    }
  }, [])

  useEffect(() => {
    if (xmtpClient) initXmtp()
  }, [xmtpClient])

  return (
    <>
      <h2 className="text-lg font-bold mb-3">Your conversations</h2>
      {/* Display XMTP connection options if connected but not initialized */}
      {!xmtpClient?.address || isLoading ? (
        <>Loading...</>
      ) : conversations.length > 0 ? (
        <div className="divide-y divide-solid max-w-[700px] border rounded py-1 px-2">
          {conversations.map((conversation, index) => (
            <div key={index}>
              <span className="text-gray-700">Conversation with</span>
              <Button type="link">
                <Link href={`/message/${conversation?.peerAddress}`}>
                  "{conversation?.peerAddress}"
                </Link>
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div>You did not start conversation yet!</div>
      )}
    </>
  )
}
