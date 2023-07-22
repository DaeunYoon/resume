import { useRouter } from 'next/router'

import { Client } from '@xmtp/xmtp-js'
import { ethers } from 'ethers'
import { useEffect, useState, useRef } from 'react'
import Chat from '~/components/Chat'
import { Button } from 'antd'

import BackButton from '~/components/BackButton'

export default function Page() {
  const router = useRouter()
  const [messages, setMessages] = useState(null)
  const convRef = useRef(null)
  const clientRef = useRef(null)
  const [signer, setSigner] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isOnNetwork, setIsOnNetwork] = useState(false)

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
    // Create the XMTP client
    const xmtp = await Client.create(signer, { env: 'production' })
    //Create or load conversation with Gm bot
    newConversation(xmtp, router.query.address)
    // Set the XMTP client in state for later use
    setIsOnNetwork(!!xmtp.address)
    //Set the client in the ref
    clientRef.current = xmtp
  }

  // Function to connect to the wallet
  const connectWallet = async function () {
    // Check if the ethereum object exists on the window object
    if (typeof window.ethereum !== 'undefined') {
      try {
        // Request access to the user's Ethereum accounts
        await window.ethereum.enable()

        // Instantiate a new ethers provider with Metamask
        const provider = new ethers.providers.Web3Provider(window.ethereum)

        // Get the signer from the ethers provider
        setSigner(provider.getSigner())

        // Update the isConnected data property based on whether we have a signer
        setIsConnected(true)
      } catch (error) {
        console.error('User rejected request', error)
      }
    } else {
      console.error('Metamask not found')
    }
  }

  useEffect(() => {
    if (!router.query.address) {
      return
    }
    connectWallet()
  }, [])

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
      {/* Display XMTP connection options if connected but not initialized */}
      {isConnected && !isOnNetwork && (
        <div>
          {signer?.address}
          <Button className="PrimaryButton" onClick={initXmtp}>
            Connect to XMTP
          </Button>
        </div>
      )}
      {/* Render the Chat component if connected, initialized, and messages exist */}
      {isConnected && isOnNetwork && messages && (
        <Chat
          client={clientRef.current}
          conversation={convRef.current}
          messageHistory={messages}
        />
      )}
    </>
  )
}
