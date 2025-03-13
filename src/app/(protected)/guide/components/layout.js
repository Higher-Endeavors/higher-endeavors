import Meta from './meta'
import Container from './container'

export default function Layout({ children }) {
  return (
    <>
      <Meta />
      <div className="min-h-screen">
        <main>
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8">
                {children}
              </div>
              <div className="lg:col-span-4">
                {/* RecentContent will be rendered here */}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
