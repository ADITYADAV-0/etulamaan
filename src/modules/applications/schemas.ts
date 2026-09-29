import { z } from "zod";

export const applicationSchema = z.object({ instrumentId: z.string().min(1), type: z.enum(["NEW", "REVERIFICATION"]), feeAmount: z.number().nonnegative() });
export type ApplicationInput = z.infer<typeof applicationSchema>;
