'use client'
import Link from 'next/link'
import { signInHandler } from "@/app/lib/signInHandler";
import { useSearchParams } from 'next/navigation'

export default function AccessRedirectContent() {
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get('redirect') || ""

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <h1 className="text-gray-800 text-2xl font-bold text-center">
            Authentication Required
          </h1>
        </div>
        
        <div className="space-y-6">
          <div className="text-center text-gray-600">
            <h2 className="text-lg font-semibold mb-2">
              We're sorry, but you must be logged in to access this content.
            </h2>
            <p className="mb-4">
              Please log in {/* or create an account */} to continue.
            </p>
            <p className="mb-4">
              Our User Portal includes Tools, Guide content, and other features designed to help you achieve your ideal self.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* <button  onClick={async () => {
                    await signInHandler();
                    history.back();
                }}
              className="btn btn-primary hover:shadow-form rounded-md bg-purple-500 hover:bg-[#9400D3] py-3 px-8 text-base font-semibold text-white outline-none text-center"
            >
              Sign In
            </button> */}
            <button  onClick={ () => {
                    signInHandler(redirectUrl);
                }}
              className="btn btn-primary hover:shadow-form rounded-md bg-purple-500 hover:bg-[#9400D3] py-3 px-8 text-base font-semibold text-white outline-none text-center"
            >
              Sign In
            </button>
            {/* <Link 
              href="/signup"
              className="btn btn-outline hover:shadow-form rounded-md bg-purple-500 hover:bg-[#9400D3] py-3 px-8 text-base font-semibold text-white outline-none text-center"
            >
              Create Account
            </Link> */}
          </div>
          
          <div className="text-sm text-center text-gray-600">
            <p>
              Already have an account but having trouble? <Link href="/contact" className="text-primary hover:underline">Get Help</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 