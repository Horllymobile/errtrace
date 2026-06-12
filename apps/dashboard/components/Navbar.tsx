'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Bug, Menu, X, Github, BookOpen, Settings } from 'lucide-react'
import Image from 'next/image'

export default function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    return (
        <nav className="sticky top-0 z-50 bg-errtrace-dark-900/95 backdrop-blur supports-[backdrop-filter]:bg-errtrace-dark-900/80 border-b border-errtrace-dark-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-3 group">
                        <Image
                            src="/logo.svg"
                            alt="ErrTrace"
                            width={140}
                            height={28}
                            priority
                        />
                    </Link>

                    {/* Desktop navigation */}
                    <div className="hidden md:flex items-center space-x-1">
                        <Link
                            href="/docs"
                            className="flex items-center space-x-1 px-3 py-2 text-errtrace-dark-300 hover:text-white rounded-lg hover:bg-errtrace-dark-800 transition-all"
                        >
                            <BookOpen className="h-4 w-4" />
                            <span>Docs</span>
                        </Link>

                        <a
                            href="https://github.com/yourusername/errtrace"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-1 px-3 py-2 text-errtrace-dark-300 hover:text-white rounded-lg hover:bg-errtrace-dark-800 transition-all"
                        >
                            <Github className="h-4 w-4" />
                            <span>GitHub</span>
                        </a>

                        <button className="flex items-center space-x-1 px-3 py-2 text-errtrace-dark-300 hover:text-white rounded-lg hover:bg-errtrace-dark-800 transition-all">
                            <Settings className="h-4 w-4" />
                            <span>Settings</span>
                        </button>
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 text-errtrace-dark-300 hover:text-white rounded-lg hover:bg-errtrace-dark-800"
                    >
                        {mobileMenuOpen ? (
                            <X className="h-6 w-6" />
                        ) : (
                            <Menu className="h-6 w-6" />
                        )}
                    </button>
                </div>

                {/* Mobile menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-errtrace-dark-800">
                        <div className="space-y-1">
                            <Link
                                href="/docs"
                                className="flex items-center space-x-2 px-3 py-2 text-errtrace-dark-300 hover:text-white rounded-lg hover:bg-errtrace-dark-800 transition-all"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <BookOpen className="h-4 w-4" />
                                <span>Documentation</span>
                            </Link>
                            <a
                                href="https://github.com/yourusername/errtrace"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-2 px-3 py-2 text-errtrace-dark-300 hover:text-white rounded-lg hover:bg-errtrace-dark-800 transition-all"
                            >
                                <Github className="h-4 w-4" />
                                <span>GitHub</span>
                            </a>
                            <button className="flex items-center space-x-2 px-3 py-2 text-errtrace-dark-300 hover:text-white rounded-lg hover:bg-errtrace-dark-800 transition-all w-full">
                                <Settings className="h-4 w-4" />
                                <span>Settings</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}