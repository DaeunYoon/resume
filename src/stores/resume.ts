import axios from 'axios'
import { produce } from 'immer'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { setUpStorage, storeFile } from '~/helpers/web3Storage'
import type { Resume } from '~/types'

function deleteOverlappingResume(arr: Resume[]): Resume[] {
  const addrCounts: { [addr: string]: number } = {}
  const result: { [addr: string]: Resume } = {}

  // Count occurrences of each key in the array
  arr.forEach((obj) => {
    const addr = obj.walletAddress
    addrCounts[addr] = (addrCounts[addr] || 0) + 1

    // Keep only one occurrence of each key in the result object
    if (addrCounts[addr] === 1) {
      result[addr] = obj
    }
  })

  // Convert the result object back to an array
  return Object.values(result)
}

interface ResumesStore {
  fetchResumes: () => Promise<void>
  addResume: (resume: Resume) => Promise<string>
  state: {
    isLoading: boolean
    isUploading: boolean
    resumes: Resume[]
  }
}

const state = {
  isLoading: false,
  isUploading: false,
  resumes: [],
}

export const useResumesStore = create<ResumesStore>()(
  immer((set, _get) => ({
    fetchResumes: async () => {
      set(
        produce((draft) => {
          draft.state.isLoading = true
        })
      )

      let resumes = []

      try {
        resumes = await setUpStorage()
      } catch (e) {
        console.log(e)
      }

      if (resumes) {
        const uniqueResumes = deleteOverlappingResume(resumes)
        set(
          produce((draft) => {
            draft.state.resumes = uniqueResumes || state?.resumes
          })
        )
      }

      set(
        produce((draft) => {
          draft.state.isLoading = false
        })
      )
    },
    addResume: async (resume: Resume) => {
      set(
        produce((draft) => {
          draft.state.isUploading = true
        })
      )

      let uploadedResume: Resume | null = null
      try {
        const { file } = await storeFile(resume)
        uploadedResume = file
      } catch (e) {
        console.log(e)
      }

      if (uploadedResume) {
        set(
          produce((draft) => {
            draft.state.resumes = deleteOverlappingResume([
              uploadedResume,
              ...draft.state.resumes,
            ])
          })
        )
      }

      set(
        produce((draft) => {
          draft.state.isUploading = false
        })
      )
    },
    state,
  }))
)
