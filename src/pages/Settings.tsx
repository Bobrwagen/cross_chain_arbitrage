import { useState } from 'react'
import { 
  Settings as SettingsIcon,
  Shield,
  Bell,
  Zap,
  Save,
  Trash2
} from 'lucide-react'

export default function Settings() {
  const [settings, setSettings] = useState({
    autoArbitrage: false,
    maxSlippage: 0.5,
    gasLimit: 300000,
    notifications: {
      email: true,
      push: false,
      telegram: false,
    },
    security: {
      requireConfirmation: true,
      maxTransactionValue: 10000,
      whitelistAddresses: [],
    },
    trading: {
      minProfitThreshold: 0.5,
      maxConcurrentTrades: 5,
      preferredChains: ['ethereum', 'polygon', 'arbitrum'],
    },
  })

  const [isSaving, setIsSaving] = useState(false)

  const handleSettingChange = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value,
      },
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate saving settings
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
  }

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to default?')) {
      setSettings({
        autoArbitrage: false,
        maxSlippage: 0.5,
        gasLimit: 300000,
        notifications: {
          email: true,
          push: false,
          telegram: false,
        },
        security: {
          requireConfirmation: true,
          maxTransactionValue: 10000,
          whitelistAddresses: [],
        },
        trading: {
          minProfitThreshold: 0.5,
          maxConcurrentTrades: 5,
          preferredChains: ['ethereum', 'polygon', 'arbitrum'],
        },
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-secondary-400">Configure your trading preferences and security</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleReset}
            className="btn-outline flex items-center space-x-2 text-error-500 hover:text-error-400"
          >
            <Trash2 size={16} />
            <span>Reset</span>
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-primary flex items-center space-x-2"
          >
            <Save size={16} />
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trading Settings */}
        <div className="card">
          <div className="flex items-center space-x-2 mb-6">
            <Zap size={20} className="text-primary-400" />
            <h2 className="text-lg font-semibold text-white">Trading Settings</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settings.autoArbitrage}
                  onChange={(e) => setSettings(prev => ({ ...prev, autoArbitrage: e.target.checked }))}
                  className="rounded border-secondary-600 bg-secondary-700"
                />
                <span className="text-sm font-medium text-white">Enable Auto-Arbitrage</span>
              </label>
              <p className="text-xs text-secondary-400 mt-1">
                Automatically execute profitable arbitrage opportunities
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-2">
                Maximum Slippage (%)
              </label>
              <input
                type="number"
                value={settings.maxSlippage}
                onChange={(e) => setSettings(prev => ({ ...prev, maxSlippage: Number(e.target.value) }))}
                step="0.1"
                min="0.1"
                max="50"
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-2">
                Gas Limit
              </label>
              <input
                type="number"
                value={settings.gasLimit}
                onChange={(e) => setSettings(prev => ({ ...prev, gasLimit: Number(e.target.value) }))}
                min="21000"
                max="1000000"
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-2">
                Minimum Profit Threshold (%)
              </label>
              <input
                type="number"
                value={settings.trading.minProfitThreshold}
                onChange={(e) => handleSettingChange('trading', 'minProfitThreshold', Number(e.target.value))}
                step="0.1"
                min="0.1"
                max="10"
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-2">
                Max Concurrent Trades
              </label>
              <input
                type="number"
                value={settings.trading.maxConcurrentTrades}
                onChange={(e) => handleSettingChange('trading', 'maxConcurrentTrades', Number(e.target.value))}
                min="1"
                max="20"
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="card">
          <div className="flex items-center space-x-2 mb-6">
            <Shield size={20} className="text-success-400" />
            <h2 className="text-lg font-semibold text-white">Security Settings</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settings.security.requireConfirmation}
                  onChange={(e) => handleSettingChange('security', 'requireConfirmation', e.target.checked)}
                  className="rounded border-secondary-600 bg-secondary-700"
                />
                <span className="text-sm font-medium text-white">Require Confirmation</span>
              </label>
              <p className="text-xs text-secondary-400 mt-1">
                Always ask for confirmation before executing trades
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-2">
                Maximum Transaction Value ($)
              </label>
              <input
                type="number"
                value={settings.security.maxTransactionValue}
                onChange={(e) => handleSettingChange('security', 'maxTransactionValue', Number(e.target.value))}
                min="100"
                max="100000"
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-2">
                Whitelist Addresses
              </label>
              <textarea
                placeholder="Enter addresses separated by commas"
                className="input min-h-[80px] resize-none"
                value={settings.security.whitelistAddresses.join(', ')}
                onChange={(e) => handleSettingChange('security', 'whitelistAddresses', e.target.value.split(',').map(addr => addr.trim()))}
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="card">
          <div className="flex items-center space-x-2 mb-6">
            <Bell size={20} className="text-warning-400" />
            <h2 className="text-lg font-semibold text-white">Notification Settings</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settings.notifications.email}
                  onChange={(e) => handleSettingChange('notifications', 'email', e.target.checked)}
                  className="rounded border-secondary-600 bg-secondary-700"
                />
                <span className="text-sm font-medium text-white">Email Notifications</span>
              </label>
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settings.notifications.push}
                  onChange={(e) => handleSettingChange('notifications', 'push', e.target.checked)}
                  className="rounded border-secondary-600 bg-secondary-700"
                />
                <span className="text-sm font-medium text-white">Push Notifications</span>
              </label>
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settings.notifications.telegram}
                  onChange={(e) => handleSettingChange('notifications', 'telegram', e.target.checked)}
                  className="rounded border-secondary-600 bg-secondary-700"
                />
                <span className="text-sm font-medium text-white">Telegram Notifications</span>
              </label>
            </div>
          </div>
        </div>

        {/* API Settings */}
        <div className="card">
          <div className="flex items-center space-x-2 mb-6">
            <SettingsIcon size={20} className="text-secondary-400" />
            <h2 className="text-lg font-semibold text-white">API Configuration</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-2">
                1inch API Key
              </label>
              <input
                type="password"
                placeholder="Enter your 1inch API key"
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-2">
                RPC Endpoints
              </label>
              <textarea
                placeholder="Enter RPC endpoints for each chain"
                className="input min-h-[100px] resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-2">
                Webhook URL
              </label>
              <input
                type="url"
                placeholder="https://your-webhook-url.com"
                className="input"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 