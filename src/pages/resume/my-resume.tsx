import { useState, useEffect } from 'react'
import { Input, Form, Button } from 'antd'
import { useResumesStore } from '~/stores/resume'
import type { Resume } from '~/types'

import { useAccount } from 'wagmi'

export default function Home() {
  const { addResume, fetchResumeById } = useResumesStore()
  const { myResume, isUploading, isLoading } = useResumesStore(
    (state) => state.state
  )
  const { address } = useAccount()

  useEffect(() => {
    fetchResumeById()
  }, [])

  const onFinish = (value: any) => {
    addResume({
      ...value,
      walletAddress: address,
    })
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (isUploading) {
    return <div>Uploading...</div>
  }

  return (
    <>
      <Form
        name="basic"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        style={{ maxWidth: 600 }}
        onFinish={onFinish}
        autoComplete="off"
      >
        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: 'Please input name' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Position"
          name="position"
          rules={[{ required: true, message: 'Please input position' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Location"
          name="location"
          rules={[{ required: true, message: 'Please input location' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Button htmlType="submit">Submit</Button>
        </Form.Item>
      </Form>
    </>
  )
}
