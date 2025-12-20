import { z } from "zod";

export const onboardingSchema = z.object({
    linkedinUrl: z.string().url("Please enter a valid LinkedIn URL").includes("linkedin.com", { message: "Must be a LinkedIn URL" }),
    struggle: z.string().min(10, "Please elaborate a bit more on your struggle (min 10 chars).").max(300),
    helpingOthers: z.string().min(10, "Please share what you love helping with (min 10 chars).").max(300),
    timezone: z.string().optional(),
});

export type OnboardingData = z.infer<typeof onboardingSchema>;
