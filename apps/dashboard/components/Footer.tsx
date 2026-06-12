import Link from 'next/link'
import { Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-errtrace-dark-900 border-t border-errtrace-dark-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-3">
              <div className="bg-errtrace-primary p-1.5 rounded-lg">
                <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="text-white font-semibold">ErrTrace</span>
            </div>
            <p className="text-errtrace-dark-400 text-sm max-w-md">
              Simple, powerful error tracking for modern applications. 
              Open source and easy to self-host.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-white font-semibold mb-3">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/docs" className="text-errtrace-dark-400 hover:text-white text-sm transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-errtrace-dark-400 hover:text-white text-sm transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/changelog" className="text-errtrace-dark-400 hover:text-white text-sm transition-colors">
                  Changelog
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-semibold mb-3">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a href="https://github.com/yourusername/errtrace" target="_blank" rel="noopener" className="text-errtrace-dark-400 hover:text-white text-sm transition-colors">
                  GitHub
                </a>
              </li>
              <li>
                <a href="https://discord.gg/errtrace" target="_blank" rel="noopener" className="text-errtrace-dark-400 hover:text-white text-sm transition-colors">
                  Discord
                </a>
              </li>
              <li>
                <Link href="/blog" className="text-errtrace-dark-400 hover:text-white text-sm transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-errtrace-dark-800 flex flex-col sm:flex-row items-center justify-between">
          <p className="text-errtrace-dark-500 text-sm">
            © {new Date().getFullYear()} ErrTrace. All rights reserved.
          </p>
          <p className="text-errtrace-dark-500 text-sm mt-2 sm:mt-0 flex items-center">
            Made with <Heart className="h-4 w-4 text-red-500 mx-1" /> by the community
          </p>
        </div>
      </div>
    </footer>
  )
}