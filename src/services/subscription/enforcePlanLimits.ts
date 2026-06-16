import { AppError } from "../../utils/AppError.ts";
import { ERRORS } from "../../constants/index.ts";
import { getPlan } from "./getPlan.ts";
import { getOrganizationById, getOrganizationPlan } from "../organization/organization.service.ts";
import * as usageService from "../../services/usage/usage.service.ts";


export const enforceLinkCreationLimit = async (
  organizationId: number
) => {
  const current_plan = await getOrganizationPlan(
    organizationId
  );
  //console.log(current_plan);
  const usage = await usageService.getCurrentUsage(Number(organizationId));
  //console.log(usage);

  const plan = getPlan(current_plan);
  //console.log(plan);

  if (
    plan.max_links &&
    usage.links_created >= plan.max_links
  ) {
    throw new AppError(ERRORS.URL_LIMIT_REACHED);
  }

  // return plan;
};