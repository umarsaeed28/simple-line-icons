'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  HomeIcon, 
  PaintBrushIcon, 
  ShoppingCartIcon, 
  UserIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import toast from 'react-hot-toast'

interface AgentStatus {
  name: string
  status: 'healthy' | 'warning' | 'error' | 'loading'
  url: string
  port: number
  lastCheck: string
  responseTime: number
}

interface SystemStats {
  totalRequests: number
  activeConnectors: number
  productsInDatabase: number
  designsGenerated: number
}

const mockStats: SystemStats = {
  totalRequests: 1247,
  activeConnectors: 4,
  productsInDatabase: 15420,
  designsGenerated: 89
}

const mockChartData = [
  { name: 'Mon', requests: 45, designs: 12 },
  { name: 'Tue', requests: 52, designs: 15 },
  { name: 'Wed', requests: 38, designs: 8 },
  { name: 'Thu', requests: 67, designs: 22 },
  { name: 'Fri', requests: 89, designs: 31 },
  { name: 'Sat', requests: 76, designs: 28 },
  { name: 'Sun', requests: 34, designs: 11 },
]

const mockProductData = [
  { name: 'Amazon', value: 45, color: '#3B82F6' },
  { name: 'Wayfair', value: 25, color: '#10B981' },
  { name: 'Home Depot', value: 20, color: '#F59E0B' },
  { name: 'Target', value: 10, color: '#EF4444' },
]

export default function Dashboard() {
  const [agents, setAgents] = useState<AgentStatus[]>([
    {
      name: 'Designer Agent',
      status: 'loading',
      url: process.env.NEXT_PUBLIC_DESIGNER_AGENT_URL || 'http://localhost:3001',
      port: 3001,
      lastCheck: new Date().toISOString(),
      responseTime: 0
    },
    {
      name: 'Data Agent',
      status: 'loading',
      url: process.env.NEXT_PUBLIC_DATA_AGENT_URL || 'http://localhost:3002',
      port: 3002,
      lastCheck: new Date().toISOString(),
      responseTime: 0
    },
    {
      name: 'User Agent',
      status: 'loading',
      url: process.env.NEXT_PUBLIC_USER_AGENT_URL || 'http://localhost:3003',
      port: 3003,
      lastCheck: new Date().toISOString(),
      responseTime: 0
    }
  ])

  const checkAgentHealth = async (agent: AgentStatus) => {
    try {
      const startTime = Date.now()
      const response = await fetch(`${agent.url}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
      const responseTime = Date.now() - startTime
      
      if (response.ok) {
        return {
          ...agent,
          status: 'healthy' as const,
          responseTime,
          lastCheck: new Date().toISOString()
        }
      } else {
        return {
          ...agent,
          status: 'error' as const,
          responseTime,
          lastCheck: new Date().toISOString()
        }
      }
    } catch (error) {
      return {
        ...agent,
        status: 'error' as const,
        responseTime: 0,
        lastCheck: new Date().toISOString()
      }
    }
  }

  useEffect(() => {
    const checkAllAgents = async () => {
      const updatedAgents = await Promise.all(
        agents.map(agent => checkAgentHealth(agent))
      )
      setAgents(updatedAgents)
    }

    checkAllAgents()
    const interval = setInterval(checkAllAgents, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = (status: AgentStatus['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-500" />
      case 'loading':
        return <ClockIcon className="h-5 w-5 text-blue-500 animate-spin" />
    }
  }

  const getStatusColor = (status: AgentStatus['status']) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      case 'loading':
        return 'bg-blue-100 text-blue-800'
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
                Room-in-a-Box Admin
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Agent Status Cards */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Agent Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {agents.map((agent, index) => (
              <motion.div
                key={agent.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    {getStatusIcon(agent.status)}
                    <h3 className="ml-2 text-lg font-medium text-gray-900">
                      {agent.name}
                    </h3>
                  </div>
                  <span className={`status-badge ${getStatusColor(agent.status)}`}>
                    {agent.status}
                  </span>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Port:</span>
                    <span className="font-mono">{agent.port}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Response Time:</span>
                    <span>{agent.responseTime}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Check:</span>
                    <span>{new Date(agent.lastCheck).toLocaleTimeString()}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* System Stats */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            System Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="card"
            >
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <PaintBrushIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Requests</p>
                  <p className="text-2xl font-bold text-gray-900">{mockStats.totalRequests}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="card"
            >
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <ShoppingCartIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Connectors</p>
                  <p className="text-2xl font-bold text-gray-900">{mockStats.activeConnectors}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="card"
            >
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <HomeIcon className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Products in DB</p>
                  <p className="text-2xl font-bold text-gray-900">{mockStats.productsInDatabase.toLocaleString()}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="card"
            >
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <UserIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Designs Generated</p>
                  <p className="text-2xl font-bold text-gray-900">{mockStats.designsGenerated}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Request Trends */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="card"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Request Trends (Last 7 Days)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="requests" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="Requests"
                />
                <Line 
                  type="monotone" 
                  dataKey="designs" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Designs"
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Product Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="card"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Product Distribution by Source
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mockProductData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {mockProductData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </main>
    </div>
  )
}