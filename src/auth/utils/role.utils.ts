export const ROLE_HIERARCHY = {
  SUPER_ADMIN: 200,
  ADMIN: 100,
  EDITOR: 50
} as const;

export type UserRole = keyof typeof ROLE_HIERARCHY;

/**
 * Checks if a user has the required role or higher
 */
export function hasRequiredRole(
  userRole: string,
  requiredRole: string
): boolean {
  const userRoleLevel = ROLE_HIERARCHY[userRole as UserRole] || 0;
  const requiredRoleLevel = ROLE_HIERARCHY[requiredRole as UserRole] || 0;
  return userRoleLevel >= requiredRoleLevel;
}

/**
 * Checks if a user has any of the required roles
 */
export function hasAnyRole(userRole: string, requiredRoles: string[]): boolean {
  return requiredRoles.some(role => hasRequiredRole(userRole, role));
}

/**
 * Gets all roles that the user can access (including higher roles)
 */
export function getAccessibleRoles(userRole: string): string[] {
  const userRoleLevel = ROLE_HIERARCHY[userRole as UserRole] || 0;
  return Object.entries(ROLE_HIERARCHY)
    .filter(([_, level]) => level <= userRoleLevel)
    .map(([role, _]) => role);
}

/**
 * Gets the role level for a given role
 */
export function getRoleLevel(role: string): number {
  return ROLE_HIERARCHY[role as UserRole] || 0;
}

/**
 * Checks if a role is valid
 */
export function isValidRole(role: string): role is UserRole {
  return role in ROLE_HIERARCHY;
}

/**
 * Role-based permissions for different features
 * Based on the Next.js medicard repository structure
 */
export const ROLE_PERMISSIONS = {
  // Content Management
  NEWS: ["SUPER_ADMIN", "ADMIN", "EDITOR"],
  SERVICES: ["SUPER_ADMIN", "ADMIN", "EDITOR"],
  MEDIA: ["SUPER_ADMIN", "ADMIN", "EDITOR"],
  BANNERS: ["SUPER_ADMIN", "ADMIN", "EDITOR"],

  // Advanced Management
  TEAM: ["SUPER_ADMIN", "ADMIN"],
  EQUIPMENT: ["SUPER_ADMIN", "ADMIN"],
  CONTACT: ["SUPER_ADMIN", "ADMIN"],

  // System Management
  USERS: ["SUPER_ADMIN"],
  LOGS: ["SUPER_ADMIN", "ADMIN"]
} as const;

/**
 * Checks if a user can access a specific feature
 */
export function canAccessFeature(
  userRole: string,
  feature: keyof typeof ROLE_PERMISSIONS
): boolean {
  const allowedRoles = ROLE_PERMISSIONS[feature];
  return allowedRoles.includes(userRole as any);
}

/**
 * Gets all features accessible by a user role
 */
export function getAccessibleFeatures(
  userRole: string
): (keyof typeof ROLE_PERMISSIONS)[] {
  return Object.entries(ROLE_PERMISSIONS)
    .filter(([_, allowedRoles]) => allowedRoles.includes(userRole as any))
    .map(([feature, _]) => feature as keyof typeof ROLE_PERMISSIONS);
}
