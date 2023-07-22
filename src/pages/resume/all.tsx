import { useEffect } from 'react'
import { useResumesStore } from '~/stores/resume'
import type { Resume } from '~/types'
import { Table } from 'antd'
import { useRouter } from 'next/router'

export default function Home() {
  const { fetchResumes } = useResumesStore()
  const { resumes, isLoading } = useResumesStore((state) => state.state)
  const router = useRouter()

  useEffect(() => {
    if (resumes.length === 0) {
      fetchResumes()
    }
  }, [])

  if (isLoading) {
    return <div>Loading...</div>
  }

  const columns: ColumnsType<Resume> = [
    {
      title: 'Name',
      dataIndex: 'name',
    },
    {
      title: 'Position',
      dataIndex: 'position',
    },
    {
      title: 'Location',
      dataIndex: 'location',
    },
  ]

  return (
    <>
      {resumes.length ? (
        <div>
          <Table
            onRow={(record) => {
              return {
                onClick: () => router.push(`/resume/${record.walletAddress}`), // click row
              }
            }}
            rowClassName="cursor-pointer"
            columns={columns}
            dataSource={resumes}
          />
        </div>
      ) : (
        <div>No Resumes are uploaded yet!</div>
      )}
    </>
  )
}
