import { auth } from "@clerk/nextjs/server";
import { PLANS, PLAN_LIMITS, PlanType } from "@/lib/subscription-constants"

export const getUserPlan = async (): Promise<PlanType> => {
    const { has, userId } = await auth();

    if (!userId) return PLANS.FREE;

    if (has({ plan: "pro" })) return PLANS.PRO;
    if (has({ plan: "standard" })) return PLANS.STANDARD;

    // Fallback to metadata
    const { currentUser } = await import("@clerk/nextjs/server");
    const user = await currentUser();
    const metadataPlan = (user?.publicMetadata?.plan || user?.publicMetadata?.billingPlan)?.toString().toLowerCase();

    if (metadataPlan === 'pro') return PLANS.PRO;
    if (metadataPlan === 'standard') return PLANS.STANDARD;

    return PLANS.FREE
}

export const getPlanLimits = async () => {
    const plan = await getUserPlan();
    return PLAN_LIMITS[plan]
}