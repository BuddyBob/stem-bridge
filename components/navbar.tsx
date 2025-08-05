import Link from "next/link"
import Image from "next/image"

export function Navbar() {
  return (
    <nav className="bg-white border-b-2 border-slate-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative w-10 h-10">
              <Image
                src="/logo.png"
                alt="STEM For All Logo"
                fill
                className="object-contain group-hover:scale-110 transition-transform"
              />
            </div>
            <span className="text-2xl font-bold" style={{ color: '#8a427a' }}>
              STEM For All
            </span>
          </Link>

          <div className="flex items-center space-x-6">
            <Link href="/events" className="font-medium transition-colors hover:opacity-80" style={{ color: '#2c6d0d' }}>
              Events
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
