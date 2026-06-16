import { SUBSCRIPTION_PLANS } from "../../constants/plans.ts";

export const getPlan = (plan: string) => {
  return SUBSCRIPTION_PLANS[
    plan as keyof typeof SUBSCRIPTION_PLANS
  ];
};