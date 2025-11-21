// User Roles & Permissions System

import type { UserRole } from "./db"

export interface Permission {
  resource: string
  action: string
}

const rolePermissions: Record<UserRole, Permission[]> = {
  admin: [
    { resource: "forms", action: "create" },
    { resource: "forms", action: "read" },
    { resource: "forms", action: "update" },
    { resource: "forms", action: "delete" },
    { resource: "submissions", action: "read" },
    { resource: "submissions", action: "delete" },
    { resource: "work-orders", action: "create" },
    { resource: "work-orders", action: "read" },
    { resource: "work-orders", action: "update" },
    { resource: "work-orders", action: "delete" },
    { resource: "users", action: "create" },
    { resource: "users", action: "read" },
    { resource: "users", action: "update" },
    { resource: "users", action: "delete" },
    { resource: "analytics", action: "read" },
  ],
  manager: [
    { resource: "forms", action: "create" },
    { resource: "forms", action: "read" },
    { resource: "forms", action: "update" },
    { resource: "submissions", action: "read" },
    { resource: "work-orders", action: "create" },
    { resource: "work-orders", action: "read" },
    { resource: "work-orders", action: "update" },
    { resource: "analytics", action: "read" },
  ],
  "field-worker": [
    { resource: "forms", action: "read" },
    { resource: "submissions", action: "create" },
    { resource: "submissions", action: "read" },
    { resource: "work-orders", action: "read" },
    { resource: "work-orders", action: "update" },
  ],
  viewer: [
    { resource: "forms", action: "read" },
    { resource: "submissions", action: "read" },
    { resource: "analytics", action: "read" },
  ],
}

export function hasPermission(role: UserRole, resource: string, action: string): boolean {
  const permissions = rolePermissions[role] || []
  return permissions.some((p) => p.resource === resource && p.action === action)
}

export function canCreateForms(role: UserRole): boolean {
  return hasPermission(role, "forms", "create")
}

export function canDeleteForms(role: UserRole): boolean {
  return hasPermission(role, "forms", "delete")
}

export function canManageUsers(role: UserRole): boolean {
  return hasPermission(role, "users", "create")
}

export function canViewAnalytics(role: UserRole): boolean {
  return hasPermission(role, "analytics", "read")
}

