'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  HomeIcon, 
  PaintBrushIcon, 
  ShoppingCartIcon,
  ArrowRightIcon,
  PhotoIcon,
  CurrencyDollarIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface RoomGeometry {
  width: number
  length: number
  height: number
  openings: Array<{
    type: 'door' | 'window' | 'fireplace' | 'closet'
    position: { x: number; y: number }
    dimensions: { width: number; height: number }
  }>
}

interface DesignRequest {
  roomGeometry: RoomGeometry
  budgetUsd: number
  roomType: string
  stylePreferences: string[]
  referenceImageUrl?: string
}

export default function DesignPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [designRequest, setDesignRequest] = useState<DesignRequest>({
    roomGeometry: {
      width: 20,
      length: 30,
      height: 9,
      openings: []
    },
    budgetUsd: 5000,
    roomType: 'living_room',
    stylePreferences: []
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<any>(null)

  const roomTypes = [
    { value: 'living_room', label: 'Living Room', icon: HomeIcon },
    { value: 'bedroom', label: 'Bedroom', icon: UserIcon },
    { value: 'dining_room', label: 'Dining Room', icon: ShoppingCartIcon },
    { value: 'kitchen', label: 'Kitchen', icon: PaintBrushIcon },
    { value: 'office', label: 'Office', icon: UserIcon },
    { value: 'bathroom', label: 'Bathroom', icon: HomeIcon },
    { value: 'entryway', label: 'Entryway', icon: HomeIcon }
  ]

  const styleOptions = [
    'Modern', 'Traditional', 'Scandinavian', 'Industrial', 'Bohemian',
    'Minimalist', 'Contemporary', 'Rustic', 'Luxury', 'Coastal',
    'Mid-century', 'Art Deco', 'Victorian', 'Asian', 'Mediterranean'
  ]

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setIsProcessing(true)
    toast.loading('Generating your room design...')

    try {
      const response = await fetch('http://localhost:3003/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomGeometry: designRequest.roomGeometry,
          budgetUsd: designRequest.budgetUsd,
          roomType: designRequest.roomType,
          preferences: {
            style_preference: designRequest.stylePreferences.join(', ')
          }
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        setResult(data.data)
        toast.success('Design generated successfully!')
      } else {
        toast.error('Failed to generate design')
      }
    } catch (error) {
      toast.error('Error connecting to design service')
    } finally {
      setIsProcessing(false)
    }
  }

  const updateDesignRequest = (updates: Partial<DesignRequest>) => {
    setDesignRequest(prev => ({ ...prev, ...updates }))
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
                Room Design Studio
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Step {currentStep} of 4
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm text-gray-500">{Math.round((currentStep / 4) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-primary-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / 4) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="card">
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Room Dimensions
                </h2>
                <p className="text-gray-600">
                  Enter the dimensions of your room to get started.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Width (feet)
                  </label>
                  <input
                    type="number"
                    value={designRequest.roomGeometry.width}
                    onChange={(e) => updateDesignRequest({
                      roomGeometry: {
                        ...designRequest.roomGeometry,
                        width: Number(e.target.value)
                      }
                    })}
                    className="input-field"
                    min="1"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Length (feet)
                  </label>
                  <input
                    type="number"
                    value={designRequest.roomGeometry.length}
                    onChange={(e) => updateDesignRequest({
                      roomGeometry: {
                        ...designRequest.roomGeometry,
                        length: Number(e.target.value)
                      }
                    })}
                    className="input-field"
                    min="1"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Height (feet)
                  </label>
                  <input
                    type="number"
                    value={designRequest.roomGeometry.height}
                    onChange={(e) => updateDesignRequest({
                      roomGeometry: {
                        ...designRequest.roomGeometry,
                        height: Number(e.target.value)
                      }
                    })}
                    className="input-field"
                    min="1"
                    max="20"
                  />
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <HomeIcon className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-sm text-blue-800">
                    Room Area: {designRequest.roomGeometry.width * designRequest.roomGeometry.length} sq ft
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Room Type & Budget
                </h2>
                <p className="text-gray-600">
                  Select your room type and set your budget.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Room Type
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {roomTypes.map((roomType) => {
                    const Icon = roomType.icon
                    return (
                      <button
                        key={roomType.value}
                        onClick={() => updateDesignRequest({ roomType: roomType.value })}
                        className={`p-4 border rounded-lg text-left transition-colors ${
                          designRequest.roomType === roomType.value
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <Icon className="h-6 w-6 text-gray-600 mb-2" />
                        <div className="text-sm font-medium text-gray-900">
                          {roomType.label}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget (USD)
                </label>
                <div className="relative">
                  <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    value={designRequest.budgetUsd}
                    onChange={(e) => updateDesignRequest({ budgetUsd: Number(e.target.value) })}
                    className="input-field pl-10"
                    min="100"
                    max="50000"
                    step="100"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Style Preferences
                </h2>
                <p className="text-gray-600">
                  Select your preferred design styles (select multiple).
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Design Styles
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {styleOptions.map((style) => (
                    <button
                      key={style}
                      onClick={() => {
                        const current = designRequest.stylePreferences
                        const updated = current.includes(style)
                          ? current.filter(s => s !== style)
                          : [...current, style]
                        updateDesignRequest({ stylePreferences: updated })
                      }}
                      className={`p-3 border rounded-lg text-sm transition-colors ${
                        designRequest.stylePreferences.includes(style)
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-300 hover:border-gray-400 text-gray-700'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reference Image URL (Optional)
                </label>
                <div className="relative">
                  <PhotoIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="url"
                    value={designRequest.referenceImageUrl || ''}
                    onChange={(e) => updateDesignRequest({ referenceImageUrl: e.target.value })}
                    className="input-field pl-10"
                    placeholder="https://example.com/inspiration-image.jpg"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 4 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Review & Generate
                </h2>
                <p className="text-gray-600">
                  Review your design request and generate your room design.
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Room Dimensions</span>
                    <p className="text-gray-900">
                      {designRequest.roomGeometry.width}' × {designRequest.roomGeometry.length}' × {designRequest.roomGeometry.height}'
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Room Type</span>
                    <p className="text-gray-900 capitalize">
                      {designRequest.roomType.replace('_', ' ')}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Budget</span>
                    <p className="text-gray-900">
                      ${designRequest.budgetUsd.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Styles</span>
                    <p className="text-gray-900">
                      {designRequest.stylePreferences.length > 0 
                        ? designRequest.stylePreferences.join(', ')
                        : 'None selected'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-50 border border-green-200 rounded-lg p-6"
                >
                  <h3 className="text-lg font-medium text-green-900 mb-2">
                    Design Generated Successfully!
                  </h3>
                  <div className="space-y-2 text-sm text-green-800">
                    <p>Total Cost: ${result.total_cost?.amount?.toLocaleString() || 'N/A'}</p>
                    <p>Items: {result.shopping_list?.length || 0} products</p>
                    <p>Processing Time: {result.processing_time_ms}ms</p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-6 border-t border-gray-200">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back
            </button>

            {currentStep < 4 ? (
              <button
                onClick={handleNext}
                className="btn-primary flex items-center"
              >
                Next
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isProcessing}
                className="btn-primary flex items-center disabled:opacity-50"
              >
                {isProcessing ? 'Generating...' : 'Generate Design'}
                {!isProcessing && <ArrowRightIcon className="ml-2 h-4 w-4" />}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}