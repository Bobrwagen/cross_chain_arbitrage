import React, { useState } from 'react'
import { useAccount, useBalance } from 'wagmi'
import { 
  Settings as SettingsIcon,
  Wallet,
  Shield,
  Bell,
  Globe,
  AlertCircle
} from 'lucide-react'

interface SettingItem {
  name: string
  value: string | boolean | number
  type: 'text' | 'toggle' | 'slider'
  min?: number
  max?: number
  step?: number
  onChange?: (value: any) => void
}

interface SettingsSection {
  title: string
  icon: React.ComponentType<{ className?: string }>
  settings: SettingItem[]
}

export default function Settings() {
  const { address, isConnected } = useAccount()
  const { data: ethBalance } = useBalance({
    address: address,
    chainId: 1, // Ethereum mainnet
  })
  const { data: arbitrumBalance } = useBalance({
    address: address,
    chainId: 42161, // Arbitrum One
  })

  // For Sui and Solana, we'll show placeholder since they need different SDKs
  const suiBalance = isConnected ? "0.0 SUI" : "Connect wallet to display amount"
  const solanaBalance = isConnected ? "0.0 SOL" : "Connect wallet to display amount"
  
  const [slippageTolerance, setSlippageTolerance] = useState(0.5)
  const [autoExecute, setAutoExecute] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(true)

  const settingsSections: SettingsSection[] = [
    {
      title: 'Wallet',
      icon: Wallet,
      settings: [
        {
          name: 'Connected Wallet',
          value: isConnected ? `${address?.slice(0, 6)}...${address?.slice(-4)}` : 'Not connected',
          type: 'text',
        },
        {
          name: 'Ethereum Balance',
          value: isConnected ? `${ethBalance?.formatted || '0.0'} ${ethBalance?.symbol || 'ETH'}` : 'Connect wallet to display amount',
          type: 'text',
        },
        {
          name: 'Arbitrum Balance',
          value: isConnected ? `${arbitrumBalance?.formatted || '0.0'} ${arbitrumBalance?.symbol || 'ETH'}` : 'Connect wallet to display amount',
          type: 'text',
        },
        {
          name: 'Sui Balance',
          value: suiBalance,
          type: 'text',
        },
        {
          name: 'Solana Balance',
          value: solanaBalance,
          type: 'text',
        },
      ],
    },
    {
      title: 'Trading',
      icon: SettingsIcon,
      settings: [
        {
          name: 'Slippage Tolerance',
          value: slippageTolerance,
          type: 'slider',
          min: 0.1,
          max: 5,
          step: 0.1,
          onChange: setSlippageTolerance,
        },
        {
          name: 'Automated Trading',
          value: autoExecute,
          type: 'toggle',
          onChange: setAutoExecute,
        },
      ],
    },
    {
      title: 'Notifications',
      icon: Bell,
      settings: [
        {
          name: 'Trade Notifications',
          value: notifications,
          type: 'toggle',
          onChange: setNotifications,
        },
      ],
    },
    {
      title: 'Appearance',
      icon: Globe,
      settings: [
        {
          name: 'Dark Mode',
          value: darkMode,
          type: 'toggle',
          onChange: setDarkMode,
        },
      ],
    },
  ]

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-secondary-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Wallet Not Connected</h2>
          <p className="text-secondary-400 mb-4">
            Connect your wallet to access settings
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white px-6">Settings</h1>
        <p className="text-secondary-400 px-6">
          Manage your trading preferences and wallet settings
        </p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6 px-4">
        {settingsSections.map((section) => (
          <div key={section.title} className="rounded-lg bg-secondary-800 border border-secondary-700">
            <div className="px-6 py-4 border-b border-secondary-700">
              <div className="flex items-center space-x-3">
                <section.icon className="h-5 w-5 text-primary-400" />
                <h2 className="text-lg font-semibold text-white">{section.title}</h2>
              </div>
            </div>
            <div className="divide-y divide-secondary-700">
              {section.settings.map((setting) => (
                <div key={setting.name} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">{setting.name}</p>
                      {setting.type === 'text' && (
                        <p className="text-sm text-secondary-400">{setting.value as string}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-4">
                      {setting.type === 'toggle' && setting.onChange && (
                        <button
                          onClick={() => setting.onChange!(!setting.value)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            setting.value ? 'bg-primary-600' : 'bg-secondary-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              setting.value ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      )}
                      {setting.type === 'slider' && setting.onChange && setting.min && setting.max && setting.step && (
                        <div className="flex items-center space-x-3">
                          <input
                            type="range"
                            min={setting.min}
                            max={setting.max}
                            step={setting.step}
                            value={setting.value as number}
                            onChange={(e) => setting.onChange!(Number(e.target.value))}
                            className="w-24 h-2 bg-secondary-600 rounded-lg appearance-none cursor-pointer slider"
                          />
                          <span className="text-sm text-white min-w-[3rem]">{setting.value}%</span>
                        </div>
                      )}
                      {setting.type === 'text' && (
                        <span className="text-sm text-secondary-400">{setting.value as string}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Security Section */}
      <div className="rounded-lg bg-secondary-800 border border-secondary-700 px-6">
        <div className="px-6 py-4 border-b border-secondary-700">
          <div className="flex items-center space-x-3">
            <Shield className="h-5 w-5 text-green-500" />
            <h2 className="text-lg font-semibold text-white">Security</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="font-medium text-white">Wallet Connected</p>
                  <p className="text-sm text-secondary-400">Your wallet is securely connected</p>
                </div>
              </div>
            </div>
            <div className="text-sm text-secondary-400">
              <p>• Never share your private keys or seed phrase</p>
              <p>• Always verify transaction details before confirming</p>
              <p>• Use hardware wallets for large amounts</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 