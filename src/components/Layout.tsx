import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Home, 
  TrendingUp, 
  Wallet, 
  Settings as SettingsIcon,
  PlusSquare,
  BarChart2 // New icon for analytics
} from 'lucide-react'
import { Toaster } from 'react-hot-toast';

interface LayoutProps {
  children: ReactNode
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Arbitrage', href: '/arbitrage', icon: TrendingUp },
  { name: 'Create Trade', href: '/create', icon: PlusSquare },
  { name: 'Portfolio', href: '/portfolio', icon: Wallet },
  { name: 'Settings', href: '/settings', icon: SettingsIcon },
]

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()

  return (
    <div className="flex min-h-screen bg-secondary-900 text-white">
      {/* Sidebar */}
      <div className="w-64 bg-secondary-950 border-r border-secondary-800 p-4 flex flex-col">
        <div className="flex items-center pt-4 pb-8">
            <BarChart2 className="h-8 w-8 mr-3 text-primary-500" />
            <h1 className="text-2xl font-bold text-white">Chaingain</h1>
        </div>
        <nav className="space-y-2 flex-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-primary-500 text-white' 
                    : 'text-secondary-300 hover:bg-secondary-800 hover:text-white'
                }`}
              >
                <Icon className="mr-4 h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Main content */}
      <main className="flex-1">
        <Toaster 
            position="bottom-right" 
            toastOptions={{
                style: {
                    background: '#333',
                    color: '#fff',
                },
            }}
        />
        {children}
      </main>
    </div>
  )
}