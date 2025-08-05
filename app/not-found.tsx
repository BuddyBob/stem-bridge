import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-8xl mb-4">🚀</div>
        <h1 className="text-4xl font-bold text-slate-800 mb-4">Page Not Found</h1>
        <p className="text-xl text-slate-600 mb-8">Looks like this page got lost in space!</p>
        <Link href="/">
          <Button className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 rounded-2xl">
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  )
}
