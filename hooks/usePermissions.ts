'use client'

import { useAuth } from '@/context/AuthContext'
import {
  canAccessSettings,
  canAccessUserManagement,
  canCreateEditDeleteUsers,
  canViewUsers,
} from '@/lib/permissions'

export function usePermissions() {
  const { user } = useAuth()
  const role = user?.role

  return {
    role,
    canAccessSettings: canAccessSettings(role),
    canAccessUserManagement: canAccessUserManagement(role),
    canCreateEditDeleteUsers: canCreateEditDeleteUsers(role),
    canViewUsers: canViewUsers(role),
  }
}
