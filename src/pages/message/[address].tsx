import { useRouter } from 'next/router'

import { Client } from '@xmtp/xmtp-js'
import { ethers } from 'ethers'
import { useEffect, useState, useRef } from 'react'
import Chat from '~/components/Chat'
import { Button } from 'antd'
import { useXmtpClient } from '~/stores/xmtpClient'
import { useAccount } from 'wagmi'

import BackButton from '~/components/BackButton'

export default function Page() {
  const router = useRouter()
  const { address } = useAccount()
  const [messages, setMessages] = useState(null)
  const convRef = useRef(null)
  const { setClient } = useXmtpClient()
  const { isConnected, isOnNetwork, xmtpClient } = useXmtpClient(
    (state) => state.state
  )
  const [isLoading, setIsLoading] = useState(false)

  // Function to load the existing messages in a conversation
  const newConversation = async function (xmtp_client, addressTo) {
    //Creates a new conversation with the address
    if (await xmtp_client?.canMessage(router.query.address)) {
      const conversation = await xmtp_client.conversations.newConversation(
        addressTo
      )
      convRef.current = conversation
      //Loads the messages of the conversation
      const messages = await conversation.messages()
      setMessages(messages)
    } else {
      console.log('cant message because is not on the network.')
      //cant message because is not on the network.
    }
  }

  // Function to initialize the XMTP client
  const initXmtp = async function () {
    try {
      setIsLoading(true)
      await newConversation(xmtpClient, router.query.address)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!router.query.address) {
      return
    }
    if (xmtpClient?.address !== address) {
      setClient()
    }
  }, [])

  useEffect(() => {
    if (xmtpClient) initXmtp()
  }, [xmtpClient])

  useEffect(() => {
    if (isOnNetwork && convRef.current) {
      // Function to stream new messages in the conversation
      const streamMessages = async () => {
        const newStream = await convRef.current.streamMessages()
        for await (const msg of newStream) {
          const exists = messages.find((m) => m.id === msg.id)
          if (!exists) {
            setMessages((prevMessages) => {
              const msgsnew = [...prevMessages, msg]
              return msgsnew
            })
          }
        }
      }
      streamMessages()
    }
  }, [messages, isConnected, isOnNetwork])

  if (!router.query.address) {
    return (
      <div>
        <BackButton />
        <p>Invalid wallet address</p>
      </div>
    )
  }
  return (
    <>
      <BackButton />
      {/* Render the Chat component if connected, initialized, and messages exist */}
      {isLoading ? (
        <>Loading...</>
      ) : (
        isConnected &&
        isOnNetwork &&
        messages && (
          <Chat
            client={xmtpClient}
            conversation={convRef.current}
            messageHistory={messages}
          />
        )
      )}
    </>
  )
}
