import { Web3Storage } from 'web3.storage'
import type { Resume } from '~/types'

const WEB3STORAGE_TOKEN = process.env.NEXT_PUBLIC_WEB3STORAGE_TOKEN

let storage = null

export const setUpStorage = async () => {
  if (!storage) {
    storage = makeStorageClient()
  }

  const uploadedCids = await getAllCids()

  const savedProfiles = []
  for (const cid of uploadedCids) {
    savedProfiles.push(await getFile(cid))
  }
  return savedProfiles
}

function makeStorageClient() {
  return new Web3Storage({ token: WEB3STORAGE_TOKEN })
}

export async function storeFile(resume: Resume) {
  const blob = new Blob([JSON.stringify(resume)], {
    type: 'application/json',
  })
  const files = [new File([blob], 'resume.json')]

  console.log(files)

  if (!storage) {
    storage = makeStorageClient()
  }

  console.log(storage)

  const cid = await storage.put(files)
  console.log(cid)

  console.log('file stored, cid:', cid)

  // const file = await getFile(cid)
  // console.log(file)

  return cid
}

async function getFile(cid: string) {
  if (!storage) {
    storage = makeStorageClient()
  }

  const res = await storage.get(cid)
  if (!res || !res.ok) {
    throw new Error(`failed to get ${cid}`)
  }

  const files = await res.files()

  if (files.length === 0) {
    throw new Error(`No files found from ${cid}`)
  }

  return {
    ...JSON.parse(await files[0].text()),
    created: new Date(files[0].created),
  }
}

async function getAllCids() {
  if (!storage) {
    storage = makeStorageClient()
  }

  let uploadedCids = []
  for await (const upload of storage.list()) {
    uploadedCids.push(upload.cid)
  }

  return uploadedCids
}
