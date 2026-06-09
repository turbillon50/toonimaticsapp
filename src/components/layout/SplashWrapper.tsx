'use client'
import dynamic from 'next/dynamic'
const Splash = dynamic(() => import('./Splash'), { ssr: false })
export default function SplashWrapper() { return <Splash /> }
