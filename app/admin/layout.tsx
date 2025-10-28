'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Folder, UtensilsCrossed, ClipboardList, Home } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    {
      name: '分類管理',
      path: '/admin/categories',
      icon: Folder,
    },
    {
      name: '餐點管理',
      path: '/admin/menu',
      icon: UtensilsCrossed,
    },
    {
      name: '訂單管理',
      path: '/admin/orders',
      icon: ClipboardList,
    },
  ];

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b-2 border-black sticky top-0 z-20 print:hidden">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-xl font-bold text-black">管理後台</h1>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 border-2 border-black hover:bg-black hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMobileMenuOpen && (
          <nav className="border-t-2 border-black bg-white">
            <ul>
              {menuItems.map((item) => {
                const isActive = pathname === item.path;
                const IconComponent = item.icon;
                return (
                  <li key={item.path} className="border-b border-gray-300">
                    <Link
                      href={item.path}
                      onClick={closeMobileMenu}
                      className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                        isActive
                          ? 'bg-black text-white'
                          : 'text-black hover:bg-gray-100'
                      }`}
                    >
                      <IconComponent size={20} />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  </li>
                );
              })}
              <li>
                <Link
                  href="/"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 px-4 py-3 text-black hover:bg-gray-100"
                >
                  <Home size={20} />
                  <span className="font-medium">返回首頁</span>
                </Link>
              </li>
            </ul>
          </nav>
        )}
      </header>

      <div className="lg:flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-white border-r-2 border-black lg:min-h-screen lg:sticky lg:top-0 print:hidden">
          {/* Header */}
          <div className="p-6 border-b-2 border-black">
            <h1 className="text-2xl font-bold text-black">管理後台</h1>
            <p className="text-sm text-gray-600 mt-1">Restaurant Admin</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const isActive = pathname === item.path;
                const IconComponent = item.icon;
                return (
                  <li key={item.path}>
                    <Link
                      href={item.path}
                      className={`flex items-center gap-3 px-4 py-3 border-2 border-black transition-colors ${
                        isActive
                          ? 'bg-black text-white'
                          : 'bg-white text-black hover:bg-gray-100'
                      }`}
                    >
                      <IconComponent size={20} />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t-2 border-black">
            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-3 border-2 border-black text-black hover:bg-black hover:text-white transition-colors"
            >
              <Home size={20} />
              <span className="font-medium">返回首頁</span>
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          {children}
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-10 print:hidden"
          onClick={closeMobileMenu}
        />
      )}
    </div>
  );
}
