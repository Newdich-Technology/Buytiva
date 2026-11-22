export const ROLE_HOME: Record<string, string> = {
	CUSTOMER: '/dashboard/overview', PROCURER: '/dashboard/overview', ADMIN: '/dashboard/overview', SUPER_ADMIN: '/dashboard/overview'
};

export function canAccessRole(roles: string[], requiredRole: string) {
	return roles.includes(requiredRole);
}
