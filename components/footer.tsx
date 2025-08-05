import { Heart } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-slate-50 border-t-2 border-slate-100 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-slate-600 mb-4">
            <span>Made with</span>
            <Heart className="w-5 h-5 text-red-500 fill-current" />
            <span>by students, for students</span>
          </div>
          <p className="text-slate-500 text-sm">STEM For All - Empowering the next generation of innovators</p>
          <p className="text-slate-400 text-xs mt-2">
            We don't collect personal information. Signups happen through our partner platforms.
          </p>
        </div>
      </div>
    </footer>
  )
}
