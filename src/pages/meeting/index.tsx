import React, { useRef, useState, useEffect } from 'react'
import invariant from 'tiny-invariant'
import { useRouter } from 'next/router'

import { useXmtpClient } from '~/stores/xmtpClient'
import { useAccount } from 'wagmi'

import { Divider, Input, Select, Space, Button } from 'antd'
import type { InputRef } from 'antd'
import { PlusOutlined } from '@ant-design/icons'

import { useEventListener, useHuddle01 } from '@huddle01/react'
import { Audio, Video } from '@huddle01/react/components'
/* Uncomment to see the Xstate Inspector */
// import { Inspect } from '@huddle01/react/components';

import {
  useAudio,
  useLobby,
  useMeetingMachine,
  usePeers,
  useRoom,
  useVideo,
} from '@huddle01/react/hooks'

import { useDisplayName } from '@huddle01/react/app-utils'

const projectId = process.env.NEXT_PUBLIC_HUDDLE_PROJECT_ID
invariant(projectId, 'Missing NEXT_PUBLIC_HUDDLE_PROJECT_ID')

const baseURL = 'http://localhost:3000'
const Meeting = () => {
  const router = useRouter()
  const query = router.query

  /** XMTP SETUP */
  const { address } = useAccount()
  const { setClient } = useXmtpClient()
  const { isConnected, isOnNetwork, xmtpClient } = useXmtpClient(
    (state) => state.state
  )
  const [isXMTPLoading, setIsXMTPLoading] = useState(false)
  const [addresses, setAddresses] = useState([])
  const [isSendingInvitations, setIsSendingInvitations] = useState([])

  const loadConversationsAndGetAddresses = async function (xmtp_client) {
    const conversations = await xmtp_client.conversations.list()
    setAddresses(conversations.map((conversation) => conversation.peerAddress))
  }

  const getMessengerAddressList = async function () {
    try {
      setIsXMTPLoading(true)
      await loadConversationsAndGetAddresses(xmtpClient)
    } finally {
      setIsXMTPLoading(false)
    }
  }

  useEffect(() => {
    if (xmtpClient) {
      getMessengerAddressList()
    }
  }, [xmtpClient])

  // Function to load the existing messages in a conversation
  const sendRoomInvitation = async function (xmtp_client, addressTo) {
    //Creates a new conversation with the address
    if (await xmtp_client?.canMessage(addressTo)) {
      const conversation = await xmtp_client.conversations.newConversation(
        addressTo
      )
      conversation.send(`Join meeting: ${baseURL}/meeting?roomid=${roomId}`)
    } else {
      console.log('cant message because is not on the network.')
      //cant message because is not on the network.
    }
  }

  /** CALL INVITATION */
  const [selectedAddresses, setSelectedAddresses] = useState([])
  const [inputAddress, setInputAddress] = useState('')
  const inputRef = useRef<InputRef>(null)

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputAddress(event.target.value)
  }

  const addItem = (
    e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>
  ) => {
    e.preventDefault()
    if (inputAddress === '' || !inputAddress) return
    setItems([...items, inputAddress])
    setInputAddress('')
    setTimeout(() => {
      inputRef.current?.focus()
    }, 0)
  }

  /** VIDEO CALL */
  const videoRef = useRef<HTMLVideoElement>(null)

  const { state, send } = useMeetingMachine()

  const [creatingRoom, setCreatingRoom] = useState('')
  const [roomId, setRoomId] = useState('')
  const [displayNameText, setDisplayNameText] = useState('Guest')
  const { initialize, isInitialized } = useHuddle01()

  useEffect(() => {
    if (xmtpClient?.address !== address) {
      setClient()
    }
    initialize(projectId)
  }, [])

  useEffect(() => {
    if (query.roomid) {
      setRoomId(query.roomid as string)
    }
  }, [query])

  const { joinLobby } = useLobby()
  const {
    fetchAudioStream,
    produceAudio,
    stopAudioStream,
    stopProducingAudio,
    stream: micStream,
  } = useAudio()
  const {
    fetchVideoStream,
    produceVideo,
    stopVideoStream,
    stopProducingVideo,
    stream: camStream,
  } = useVideo()
  const { joinRoom, leaveRoom } = useRoom()

  const createRoom = async (title: string) => {
    const reqBody = {
      title,
      roomLock: false,
    }
    try {
      setCreatingRoom(true)

      const res = await fetch('/api/create-room', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reqBody),
      })

      const { roomId } = await res.json()
      setRoomId(roomId)
    } finally {
      setCreatingRoom(false)
    }
  }

  // Event Listner
  useEventListener('lobby:cam-on', () => {
    if (camStream && videoRef.current) videoRef.current.srcObject = camStream
  })

  const { peers } = usePeers()

  const { setDisplayName, error: displayNameError } = useDisplayName()

  useEventListener('room:joined', () => {
    console.log('room:joined')
  })
  useEventListener('lobby:joined', () => {
    console.log('lobby:joined')
  })

  if (!isInitialized) {
    return <div>Preparing your meeting room...</div>
  }

  return (
    <div className="grid grid-cols-3">
      <div className="flex flex-col gap-2 mr-2 col-span-1">
        {(state.value?.Initialized?.JoinedLobby ||
          state.value?.Initialized?.JoinedRoom) && (
          <div>
            <div className="break-words">
              {Object.values(peers).length + 1} poeple joined room!
            </div>
          </div>
        )}

        <Button
          loading={creatingRoom}
          onClick={async () => await createRoom('test', true)}
        >
          Create Room
        </Button>

        <div className="flex gap-2 flex-col">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Your Room Id"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="border-2 border-gray-300 bg-white h-10 px-5 pr-16 rounded-lg text-sm focus:outline-none mr-2"
            />

            <Button
              loading={state.value?.Initialized?.JoiningLobby}
              disabled={!joinLobby.isCallable}
              onClick={() => joinLobby(roomId)}
            >
              Join Lobby
            </Button>
          </div>
          <div className="flex flex-col gap-2 flex-wrap">
            <Select
              disabled={!roomId.length}
              value={selectedAddresses}
              placeholder="Send Invitations to..."
              mode="tags"
              onChange={setSelectedAddresses}
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <Divider style={{ margin: '8px 0' }} />
                  <Space style={{ padding: '0 8px 4px' }}>
                    <Input
                      placeholder="Please enter 0x..."
                      ref={inputRef}
                      value={inputAddress}
                      onChange={onInputChange}
                    />
                    <Button
                      type="text"
                      icon={<PlusOutlined />}
                      onClick={addItem}
                    >
                      Add Address
                    </Button>
                  </Space>
                </>
              )}
              options={addresses.map((item) => ({ label: item, value: item }))}
            />
            <Button
              disabled={!roomId.length}
              loading={isSendingInvitations}
              onClick={async () => {
                setIsSendingInvitations(true)

                for (const address of selectedAddresses) {
                  try {
                    await sendRoomInvitation(xmtpClient, address)
                  } catch (e) {
                    console.error(
                      `failed to send invitation to ${address}: ${e}`
                    )
                  }
                }
                setIsSendingInvitations(false)
              }}
            >
              Invite
            </Button>
          </div>
        </div>
        {/* LOBBY SETUP */}
        {state.value?.Initialized?.JoinedLobby && (
          <>
            <h2 className="text-base font-bold">Lobby</h2>
            <span className="text-sm text-gray-400 my-2">
              Please preparing your video & audio in lobby, once you enter room
              without set them up you cannot use it!
            </span>
            <div className="flex gap-4 flex-wrap">
              {fetchVideoStream.isCallable && (
                <Button
                  disabled={!fetchVideoStream.isCallable}
                  onClick={fetchVideoStream}
                >
                  Start video
                </Button>
              )}
              {stopVideoStream.isCallable && (
                <Button
                  disabled={!stopVideoStream.isCallable}
                  onClick={stopVideoStream}
                >
                  Stop video
                </Button>
              )}
              {fetchAudioStream.isCallable && (
                <Button
                  disabled={!fetchAudioStream.isCallable}
                  onClick={fetchAudioStream}
                >
                  Start audio
                </Button>
              )}
              {stopAudioStream.isCallable && (
                <Button
                  disabled={!stopAudioStream.isCallable}
                  onClick={stopAudioStream}
                >
                  Stop audio
                </Button>
              )}

              <Button
                loading={state.value?.Initialized?.JoiningRoom}
                disabled={!joinRoom.isCallable}
                onClick={joinRoom}
              >
                Join Room
              </Button>

              <Button
                disabled={!state.matches('Initialized.JoinedLobby')}
                onClick={() => send('LEAVE_LOBBY')}
              >
                Leave lobby
              </Button>
            </div>
          </>
        )}
        {/* ROOM SETUP */}
        {state.value?.Initialized?.JoinedRoom && (
          <>
            <h2 className="text-base font-bold">Room</h2>
            <div className="flex gap-4 flex-wrap">
              {produceAudio.isCallable && (
                <Button
                  disabled={!produceAudio.isCallable}
                  onClick={() => produceAudio(micStream)}
                >
                  Use mic
                </Button>
              )}
              {stopProducingAudio.isCallable && (
                <Button
                  disabled={!stopProducingAudio.isCallable}
                  onClick={() => stopProducingAudio()}
                >
                  Stop mic
                </Button>
              )}

              {produceVideo.isCallable && (
                <Button
                  disabled={!produceVideo.isCallable}
                  onClick={() => produceVideo(camStream)}
                >
                  Use cam
                </Button>
              )}

              {stopProducingVideo.isCallable && (
                <Button
                  disabled={!stopProducingVideo.isCallable}
                  onClick={() => stopProducingVideo()}
                >
                  Stop cam
                </Button>
              )}

              <Button disabled={!leaveRoom.isCallable} onClick={leaveRoom}>
                Leave room
              </Button>
            </div>
          </>
        )}
        {/* Uncomment to see the Xstate Inspector */}
        {/* <Inspect /> */}
      </div>
      <div>
        <video ref={videoRef} autoPlay muted></video>
        <div className="grid grid-cols-4">
          {Object.values(peers)
            .filter((peer) => peer.cam)
            .map((peer) => (
              <>
                role: {peer.role}
                <Video
                  key={peer.peerId}
                  peerId={peer.peerId}
                  track={peer.cam}
                  debug
                />
              </>
            ))}
          {Object.values(peers)
            .filter((peer) => peer.mic)
            .map((peer) => (
              <Audio key={peer.peerId} peerId={peer.peerId} track={peer.mic} />
            ))}
        </div>
      </div>
    </div>
  )
}

export default Meeting
