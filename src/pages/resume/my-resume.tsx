import { useState, useEffect } from 'react'
import { Input, Form, Button } from 'antd'
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'
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
    <div className="border p-2 block w-[670px]">
      <Form
        name="basic"
        labelCol={{ span: 3 }}
        wrapperCol={{ span: 20 }}
        style={{ display: 'flex', flexDirection: 'column', maxWidth: 650 }}
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

        <span>Educations:</span>
        <Form.List name="educations" className="w-full">
          {(fields, { add, remove }) => (
            <>
              {fields.map((field) => (
                <div key={field.key} className="w-full flex flex-col gap-1">
                  <Form.Item
                    {...field}
                    label="Name"
                    name={[field.name, 'name']}
                    rules={[{ required: true, message: 'Please input name' }]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    {...field}
                    label="Degree"
                    name={[field.name, 'degree']}
                    rules={[{ required: true, message: 'Please input degree' }]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    {...field}
                    label="Start date"
                    name={[field.name, 'start']}
                    rules={[
                      { required: true, message: 'Please input start date' },
                    ]}
                  >
                    <Input type="date" />
                  </Form.Item>
                  <div className="w-full flex">
                    <Form.Item
                      className="w-full"
                      {...field}
                      label="End date"
                      name={[field.name, 'end']}
                      rules={[
                        { required: true, message: 'Please input end date' },
                      ]}
                    >
                      <Input type="date" />
                    </Form.Item>
                    <MinusCircleOutlined
                      className="mt-3"
                      onClick={() => remove(field.name)}
                    />
                  </div>
                </div>
              ))}
              <Form.Item wrapperCol={{ offset: 0, span: 23 }}>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                >
                  Add field
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        <span>Experience:</span>
        <Form.List name="experiences" className="w-full">
          {(fields, { add, remove }) => (
            <>
              {fields.map((field) => (
                <div key={field.key} className="w-full flex flex-col gap-1">
                  <Form.Item
                    {...field}
                    label="Position"
                    name={[field.name, 'position']}
                    rules={[{ required: true, message: 'Please input name' }]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    {...field}
                    label="Company"
                    name={[field.name, 'company']}
                    rules={[{ required: true, message: 'Please input degree' }]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    {...field}
                    label="Start date"
                    name={[field.name, 'start']}
                    rules={[
                      { required: true, message: 'Please input start date' },
                    ]}
                  >
                    <Input type="date" />
                  </Form.Item>
                  <div className="w-full flex">
                    <Form.Item
                      className="w-full"
                      {...field}
                      label="End date"
                      name={[field.name, 'end']}
                      rules={[
                        { required: true, message: 'Please input end date' },
                      ]}
                    >
                      <Input type="date" />
                    </Form.Item>
                    <MinusCircleOutlined
                      className="mt-3"
                      onClick={() => remove(field.name)}
                    />
                  </div>
                </div>
              ))}
              <Form.Item wrapperCol={{ offset: 0, span: 23 }}>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                >
                  Add field
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        <Form.Item wrapperCol={{ span: 23 }}>
          <Button htmlType="submit" className="w-full PrimaryButton">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}
