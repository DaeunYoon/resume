import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

import { useAccount } from 'wagmi'

export default function RouteProtect({ children }) {
  const router = useRouter()
  const { isConnected } = useAccount()
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    authCheck(router.asPath)

    const hideContent = () => setAuthorized(false)
    router.events.on('routeChangeStart', hideContent)
    router.events.on('routeChangeComplete', authCheck)

    return () => {
      router.events.off('routeChangeStart', hideContent)
      router.events.off('routeChangeComplete', authCheck)
    }

  }, [isConnected])

  function authCheck(url) {
    // Public paths can be accessed without connect wallet
    const publicPaths = ['/resume/all']
    const path = url.split('?')[0]
    if (!isConnected && !publicPaths.includes(path)) {
      setAuthorized(false)
      router.push({
        pathname: '/resume/all',
      })
    } else {
      setAuthorized(true)
    }
  }

  return authorized && children
}
