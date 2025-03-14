'use client'

import { SessionProvider } from "next-auth/react"
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import SalesHero from './components/SalesHero'
import VideoSection from './components/VideoSection'
import ServiceCards from './components/SalesCards'
import ServiceInfo from './components/ServiceInfo'
import FAQ from './components/FAQ'
import Link from 'next/link'
import BetaTesting from './components/BetaTesting'

export default function SalesPage() {
  return (
    <SessionProvider>
        <div className="min-h-screen">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <SalesHero />
            <VideoSection />
            <BetaTesting />
            <ServiceCards />
            <ServiceInfo />
            <FAQ />
            <div className="mt-12 text-center">
            <Link
                href="/contact"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
                Contact Us
            </Link>
            
            </div>
        </div>
        <Footer />
        </div>
    </SessionProvider>
  )
} 