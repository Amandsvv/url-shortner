export const PLAN_POLICY = {
    FREE: {
        activeUrlLimit: 30,
        customExpiry: false,
        detailedAnalytics: false,
        apiAccess: false,
        customAlias: false,
    },

    PRO: {
        activeUrlLimit: 250,
        customExpiry: true,
        detailedAnalytics: true,
        apiAccess: true,
        customAlias: true,
    },
} as const;

export type UserPlan = keyof typeof PLAN_POLICY;

export function getPlanPolicy(plan: UserPlan) {
    return PLAN_POLICY[plan];
}