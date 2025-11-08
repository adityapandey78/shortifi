import { Link } from 'react-router-dom'
import { Database, Twitter, Github, Linkedin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="relative w-full border-t border-white/10 bg-black/30 backdrop-blur-md mt-auto z-10">
      <div className="container px-4 sm:px-6 lg:px-8 py-12 mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Logo & Description */}
          <div className="md:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <div className="flex items-center gap-2">
                <Database className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold text-white">Shortifi</span>
              </div>
            </Link>
            <p className="text-sm text-gray-300 leading-relaxed">
              Shorten links, amplify results. Track everything with powerful analytics.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider mb-4 text-white/90">Product</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/dashboard" className="text-sm text-gray-300 hover:text-primary transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-sm text-gray-300 hover:text-primary transition-colors">
                  Analytics
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-sm text-gray-300 hover:text-primary transition-colors">
                  QR Codes
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-sm text-gray-300 hover:text-primary transition-colors">
                  Link Management
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider mb-4 text-white/90">Resources</h3>
            <ul className="space-y-3">
              <li>
                <a href="#features" className="text-sm text-gray-300 hover:text-primary transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="https://github.com/adityapandey78" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-300 hover:text-primary transition-colors">
                  API
                </a>
              </li>
              <li>
                <a href="#contact" className="text-sm text-gray-300 hover:text-primary transition-colors">
                  Support
                </a>
              </li>
            </ul>
          </div>

          {/* Legal & Contact */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider mb-4 text-white/90">Legal</h3>
            <ul className="space-y-3 mb-6">
              <li>
                <Link to="/terms" className="text-sm text-gray-300 hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-gray-300 hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <a href="mailto:adityapandey.2402@gmail.com" className="text-sm text-gray-300 hover:text-primary transition-colors">
                  Contact
                </a>
              </li>
            </ul>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              <a 
                href="https://x.com/adityapandey78" 
                target="_blank" 
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-primary/50 transition-all duration-300 group"
              >
                <Twitter className="h-4 w-4 text-gray-300 group-hover:text-primary transition-colors" />
              </a>
              <a 
                href="https://github.com/adityapandey78" 
                target="_blank" 
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-primary/50 transition-all duration-300 group"
              >
                <Github className="h-4 w-4 text-gray-300 group-hover:text-primary transition-colors" />
              </a>
              <a 
                href="https://www.linkedin.com/in/adityapandey78/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-primary/50 transition-all duration-300 group"
              >
                <Linkedin className="h-4 w-4 text-gray-300 group-hover:text-primary transition-colors" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-300">
              © {new Date().getFullYear()} Shortifi. All rights reserved.
            </p>
            <div className="flex items-center gap-1 text-sm text-gray-300">
             
              <a 
                href="https://github.com/adityapandey78" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-medium hover:text-primary transition-colors"
              >
                Aditya Pandey
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
