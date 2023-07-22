import { useState, useEffect, useMemo } from 'react'
import { Input, Form, Button, Divider } from 'antd'
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'
import { useResumesStore } from '~/stores/resume'
import type { Resume } from '~/types'
import ResumeDetails from '~/components/ResumeDetails'
import CreateSkillAttestation from '~/components/CreateSkillAttestation'

import { useAccount } from 'wagmi'
import { ethers } from 'ethers'

import { CredentialType, IDKitWidget } from '@worldcoin/idkit'
import type { ISuccessResult } from '@worldcoin/idkit'
import invariant from 'tiny-invariant'

const WORLDCOIN_ID = process.env.NEXT_PUBLIC_WLD_APP_ID
invariant(WORLDCOIN_ID, 'WORLDCOIN_ID must be defined')

export default function Home() {
  const { addResume, fetchResumes } = useResumesStore()
  const { resumes, isUploading, isLoading } = useResumesStore(
    (state) => state.state
  )

  const [error, setError] = useState<string | undefined>()
  const [signer, setSigner] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [form] = Form.useForm()

  const { address } = useAccount()
  const myResume = useMemo(() => {
    return resumes.find((resume) => resume.walletAddress === address)
  }, [resumes, address])

  const connectWallet = async function () {
    // Check if the ethereum object exists on the window object
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.enable()
        // Instantiate a new ethers provider with Metamask

        const provider = new ethers.providers.Web3Provider(window.ethereum)

        // Get the signer from the ethers provider
        setSigner(provider.getSigner())
      } catch (error) {
        console.error('User rejected request', error)
      }
    } else {
      console.error('Metamask not found')
    }
  }

  /** Worldcoin */
  const handleProof = async (result: ISuccessResult) => {
    const reqBody = {
      merkle_root: result.merkle_root,
      nullifier_hash: result.nullifier_hash,
      proof: result.proof,
      credential_type: result.credential_type,
      action: process.env.NEXT_PUBLIC_WLD_ACTION_NAME,
      signal: '',
    }

    return fetch('/api/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reqBody),
    }).then(async (res: Response) => {
      return new Promise<void>((resolve, reject) => {
        if (res.status !== 200) {
          setError(`Error happend! ${res.detail}`)
          reject('Verification failed')
          console.error('Verification failed')
        }

        console.log('Successfully verified credential.')
        resolve()
      })
    })
  }

  useEffect(() => {
    if (resumes.length === 0) {
      fetchResumes()
    }
    connectWallet()
  }, [])

  const onFinish = (value: any) => {
    addResume({
      ...value,
      walletAddress: address,
    })
    setIsEditing(false)
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (isUploading) {
    return <div>Uploading...</div>
  }

  if (myResume && !isEditing) {
    return (
      <>
        <div className="w-full flex justify-end">
          <Button
            onClick={() => {
              setIsEditing(true)
              form.setFieldsValue(myResume)
            }}
          >
            Edit
          </Button>
        </div>
        <ResumeDetails
          resume={myResume}
          showAttestationList={false}
          signer={signer}
        />
        <Divider />
        {signer && <CreateSkillAttestation signer={signer} />}
      </>
    )
  }

  // TODO: Delete old resume once one is updated
  // Currently not supported from web3.storage
  return (
    <div className="border p-2 block w-[670px]">
      <Form
        form={form}
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
                <div
                  key={`position-${field.key}`}
                  className="w-full flex flex-col gap-1"
                >
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
                <div
                  key={`experience-${field.key}`}
                  className="w-full flex flex-col gap-1"
                >
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
          {isEditing ? (
            <Button htmlType="submit" className="w-full PrimaryButton">
              Submit
            </Button>
          ) : (
            <>
              <IDKitWidget
                action={process.env.NEXT_PUBLIC_WLD_ACTION_NAME!}
                onSuccess={() => onFinish(form.getFieldsValue())}
                handleVerify={handleProof}
                app_id={WORLDCOIN_ID}
                credential_types={[CredentialType.Orb]}
              >
                {({ open }) => (
                  <Button
                    type="button"
                    className="w-full PrimaryButton"
                    onClick={open}
                  >
                    Submit
                  </Button>
                )}
              </IDKitWidget>
              {error && <span className="text-red-500 text-base">{error}</span>}
            </>
          )}
        </Form.Item>
      </Form>
      <Divider />
      {signer && <CreateSkillAttestation signer={signer} />}
    </div>
  )
}
