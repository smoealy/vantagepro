export function isAdminUser(params: {
    userId: string;
    email?: string | null;
    sessionClaims?: any;
}): boolean {
    const adminUserIds = (process.env.ADMIN_USER_IDS ?? '')
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean);

    const adminEmails = (process.env.ADMIN_EMAILS ?? '')
        .split(',')
        .map((entry) => entry.trim().toLowerCase())
        .filter(Boolean);

    const claimAdminFlag =
        params.sessionClaims?.public_metadata?.is_admin === true ||
        params.sessionClaims?.metadata?.is_admin === true;

    if (claimAdminFlag) return true;
    if (adminUserIds.includes(params.userId)) return true;
    if (params.email && adminEmails.includes(params.email.toLowerCase())) return true;
    return false;
}
