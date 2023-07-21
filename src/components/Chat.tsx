import React, { useState } from 'react'
import { Input, Button } from 'antd'
import { shortAddress } from '~/utils'

function Chat({ client, messageHistory, conversation }) {
  const [inputValue, setInputValue] = useState('')

  // Function to handle sending a message
  const handleSend = async () => {
    if (inputValue) {
      await onSendMessage(inputValue)
      setInputValue('')
    }
  }

  // Function to handle sending a text message
  const onSendMessage = async (value) => {
    return conversation.send(value)
  }

  // MessageList component to render the list of messages
  const MessageList = ({ messages }) => {
    // Filter messages by unique id
    messages = messages.filter(
      (v, i, a) => a.findIndex((t) => t.id === v.id) === i
    )

    return (
      <div>
        {messages.map((message, index) => (
          <div key={message.id} className="flex justify-between">
            <div>
              <strong className="mr-2">
                {message.senderAddress === client.address
                  ? 'You'
                  : shortAddress(message.senderAddress)}
                :
              </strong>
              <span>{message.content}</span>
            </div>
            <span className="text-gray-400 text-sm">
              {message.sent.toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>
    )
  }

  // Function to handle input change (keypress or change event)
  const handleInputChange = (event) => {
    if (event.key === 'Enter') {
      handleSend()
    } else {
      setInputValue(event.target.value)
    }
  }
  return (
    <div className="flex flex-col gap-y-2 border rounded py-2 px-2">
      <div>
        <MessageList messages={messageHistory} />
      </div>
      <div className="flex gap-x-2">
        <Input
          type="text"
          onKeyPress={handleInputChange}
          onChange={handleInputChange}
          value={inputValue}
          placeholder="Type your text here "
        />
        <Button onClick={handleSend}>send</Button>
      </div>
    </div>
  )
}

export default Chat
