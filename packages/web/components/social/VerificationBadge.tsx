import React from 'react'

interface VerificationBadgeProps {
  level?: 'BASIC' | 'VERIFIED' | 'FEATURED'
  isVerified?: boolean
  className?: string
  showLevel?: boolean
}

export function VerificationBadge({
  level,
  isVerified = false,
  className = '',
  showLevel = false
}: VerificationBadgeProps) {
  if (!isVerified && !level) {
    return null
  }

  const getBadgeStyles = () => {
    switch (level) {
      case 'FEATURED':
        return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
      case 'VERIFIED':
        return 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
      case 'BASIC':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
      default:
        return 'bg-primary/10 text-primary'
    }
  }

  const getLevelIcon = () => {
    switch (level) {
      case 'FEATURED':
        return '⭐'
      case 'VERIFIED':
        return '✓'
      case 'BASIC':
        return '✓'
      default:
        return '✓'
    }
  }

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      {isVerified && (
        <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>
          verified
        </span>
      )}
      {showLevel && level && (
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getBadgeStyles()}`}>
          {getLevelIcon()} {level}
        </span>
      )}
    </div>
  )
}
