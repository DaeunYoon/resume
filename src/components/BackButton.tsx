import { useRouter } from 'next/router'
import { Button } from 'antd'

export default function BackButton() {
  const router = useRouter()

  return (
    <Button className="mb-3" onClick={() => router.back()}>
      Back
    </Button>
  )
}
