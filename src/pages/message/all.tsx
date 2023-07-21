import { Client } from '@xmtp/xmtp-js'
import { ethers } from 'ethers'
import { useEffect, useState, useRef } from 'react'
import Chat from '~/components/Chat'
import { Button } from 'antd'
import Link from 'next/link'

export default function Home() {
  const [signer, setSigner] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isOnNetwork, setIsOnNetwork] = useState(false)
  const [conversations, setConversations] = useState([])

  const loadConversations = async function (xmtp_client) {
    const conversations = await xmtp_client.conversations.list()
    setConversations(conversations)
  }

  // Function to initialize the XMTP client
  const initXmtp = async function () {
    // Create the XMTP client
    const xmtp = await Client.create(signer, { env: 'production' })
    loadConversations(xmtp)
    // Set the XMTP client in state for later use
    setIsOnNetwork(!!xmtp.address)
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
    connectWallet()
  }, [])

  return (
    <>
      {/* Display XMTP connection options if connected but not initialized */}
      {isConnected && !isOnNetwork && (
        <div>
          {signer?.address}
          <Button className="PrimaryButton" onClick={initXmtp}>
            Connect to XMTP
          </Button>
        </div>
      )}
      {conversations.map((conversation, index) => (
        <Button key={index} type="link">
          <Link href={`/message/${conversation?.peerAddress}`}>
            {conversation?.peerAddress}
          </Link>
        </Button>
      ))}
    </>
  )
}
