import { KaniActivityMessageSchema } from '../contracts/kaniContracts.js';

export function parseKaniActivityMessage(value) {
  const parsed = KaniActivityMessageSchema.safeParse(value);
  if (!parsed.success) {
    const message = parsed.error.issues?.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ') || parsed.error.toString();
    throw new Error(`Invalid Kani activity message: ${message}`);
  }
  return parsed.data;
}

export function isKaniActivityMessage(value) {
  return KaniActivityMessageSchema.safeParse(value).success;
}
