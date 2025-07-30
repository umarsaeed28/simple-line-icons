'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  HomeIcon, 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  CogIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface Connector {
  id: string
  name: string
  type: 'amazon' | 'wayfair' | 'homedepot' | 'target'
  status: 'active' | 'inactive' | 'error'
  apiKey?: string
  secretKey?: string
  partnerId?: string
  lastSync: string
  productsCount: number
  config: {
    categories: string[]
    priceRange: { min: number; max: number }
    updateFrequency: 'hourly' | 'daily' | 'weekly'
  }
}

const mockConnectors: Connector[] = [
  {
    id: '1',
    name: 'Amazon PA-API',
    type: 'amazon',
    status: 'active',
    lastSync: '2024-01-15T10:30:00Z',
    productsCount: 8540,
    config: {
      categories: ['Furniture', 'Home Decor', 'Lighting'],
      priceRange: { min: 10, max: 5000 },
      updateFrequency: 'daily'
    }
  },
  {
    id: '2',
    name: 'Wayfair Partner API',
    type: 'wayfair',
    status: 'active',
    lastSync: '2024-01-15T09:15:00Z',
    productsCount: 4230,
    config: {
      categories: ['Furniture', 'Rugs', 'Wall Art'],
      priceRange: { min: 25, max: 3000 },
      updateFrequency: 'daily'
    }
  },
  {
    id: '3',
    name: 'Home Depot API',
    type: 'homedepot',
    status: 'error',
    lastSync: '2024-01-14T16:45:00Z',
    productsCount: 2150,
    config: {
      categories: ['Tools', 'Hardware', 'Garden'],
      priceRange: { min: 5, max: 1000 },
      updateFrequency: 'weekly'
    }
  },
  {
    id: '4',
    name: 'Target Partner API',
    type: 'target',
    status: 'inactive',
    lastSync: '2024-01-10T12:00:00Z',
    productsCount: 480,
    config: {
      categories: ['Home', 'Kitchen', 'Bath'],
      priceRange: { min: 5, max: 500 },
      updateFrequency: 'weekly'
    }
  }
]

export default function ConnectorsPage() {
  const [connectors, setConnectors] = useState<Connector[]>(mockConnectors)
  const [selectedConnector, setSelectedConnector] = useState<Connector | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const getStatusIcon = (status: Connector['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'inactive':
        return <ClockIcon className="h-5 w-5 text-gray-500" />
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-500" />
    }
  }

  const getStatusColor = (status: Connector['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      case 'error':
        return 'bg-red-100 text-red-800'
    }
  }

  const getTypeIcon = (type: Connector['type']) => {
    const icons = {
      amazon: '🛒',
      wayfair: '🏠',
      homedepot: '🔨',
      target: '🎯'
    }
    return icons[type]
  }

  const handleAddConnector = () => {
    setSelectedConnector(null)
    setIsEditing(false)
    setIsModalOpen(true)
  }

  const handleEditConnector = (connector: Connector) => {
    setSelectedConnector(connector)
    setIsEditing(true)
    setIsModalOpen(true)
  }

  const handleDeleteConnector = async (id: string) => {
    if (confirm('Are you sure you want to delete this connector?')) {
      try {
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        setConnectors(prev => prev.filter(c => c.id !== id))
        toast.success('Connector deleted successfully')
      } catch (error) {
        toast.error('Failed to delete connector')
      }
    }
  }

  const handleTestConnector = async (id: string) => {
    try {
      toast.loading('Testing connector...')
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success('Connector test successful')
    } catch (error) {
      toast.error('Connector test failed')
    }
  }

  const handleSyncConnector = async (id: string) => {
    try {
      toast.loading('Syncing products...')
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 3000))
      toast.success('Products synced successfully')
    } catch (error) {
      toast.error('Failed to sync products')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <HomeIcon className="h-8 w-8 text-primary-600" />
              <h1 className="ml-3 text-2xl font-bold text-gray-900">
                Product Connectors
              </h1>
            </div>
            <button
              onClick={handleAddConnector}
              className="btn-primary flex items-center"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Connector
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
            >
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CogIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Connectors</p>
                  <p className="text-2xl font-bold text-gray-900">{connectors.length}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card"
            >
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {connectors.filter(c => c.status === 'active').length}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card"
            >
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <ClockIcon className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Inactive</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {connectors.filter(c => c.status === 'inactive').length}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card"
            >
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <XCircleIcon className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Errors</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {connectors.filter(c => c.status === 'error').length}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Connectors List */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Connected Partners
          </h2>
          
          <div className="space-y-4">
            {connectors.map((connector, index) => (
              <motion.div
                key={connector.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">{getTypeIcon(connector.type)}</div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {connector.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {connector.productsCount.toLocaleString()} products
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(connector.status)}
                      <span className={`status-badge ${getStatusColor(connector.status)}`}>
                        {connector.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleTestConnector(connector.id)}
                        className="btn-secondary text-sm px-3 py-1"
                      >
                        Test
                      </button>
                      <button
                        onClick={() => handleSyncConnector(connector.id)}
                        className="btn-secondary text-sm px-3 py-1"
                      >
                        Sync
                      </button>
                      <button
                        onClick={() => handleEditConnector(connector)}
                        className="btn-secondary text-sm px-3 py-1"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteConnector(connector.id)}
                        className="btn-secondary text-sm px-3 py-1 text-red-600 hover:bg-red-50"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Last Sync:</span>
                    <span className="ml-2">
                      {new Date(connector.lastSync).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Categories:</span>
                    <span className="ml-2">
                      {connector.config.categories.join(', ')}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Update Frequency:</span>
                    <span className="ml-2 capitalize">
                      {connector.config.updateFrequency}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {isEditing ? 'Edit Connector' : 'Add New Connector'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Connector Name
                </label>
                <input
                  type="text"
                  defaultValue={selectedConnector?.name || ''}
                  className="input-field"
                  placeholder="e.g., Amazon PA-API"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Connector Type
                </label>
                <select className="input-field">
                  <option value="amazon">Amazon</option>
                  <option value="wayfair">Wayfair</option>
                  <option value="homedepot">Home Depot</option>
                  <option value="target">Target</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key
                </label>
                <input
                  type="password"
                  defaultValue={selectedConnector?.apiKey || ''}
                  className="input-field"
                  placeholder="Enter API key"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secret Key
                </label>
                <input
                  type="password"
                  defaultValue={selectedConnector?.secretKey || ''}
                  className="input-field"
                  placeholder="Enter secret key"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsModalOpen(false)
                  toast.success(isEditing ? 'Connector updated' : 'Connector added')
                }}
                className="btn-primary"
              >
                {isEditing ? 'Update' : 'Add'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}