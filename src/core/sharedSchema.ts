import { z } from "zod";

export const sharedConfigSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  author: z.string().min(1),
  description: z.string().min(1),
  timerType: z.enum(["countdown", "stopwatch", "countup", "interval"]),
  url: z
    .string()
    .min(1)
    .refine((value) => /(^|\/)overlay\/(countdown|stopwatch|countup|interval)/.test(value), "url must point to /overlay/<timerType>"),
  tags: z.array(z.string()),
  createdAt: z.string().optional()
});

export type SharedConfig = z.infer<typeof sharedConfigSchema>;
