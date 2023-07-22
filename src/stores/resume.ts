import axios from 'axios'
import { produce } from 'immer'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { setUpStorage, storeFile } from '~/helpers/web3Storage'
import type { Resume } from '~/types'

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
        set(
          produce((draft) => {
            draft.state.resumes = resumes || state?.resumes
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
            draft.state.resumes = [uploadedResume, ...draft.state.resumes]
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
