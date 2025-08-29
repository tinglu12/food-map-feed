import { z } from "zod";

export const formSchema = z.object({
  link: z.url({ message: "Invalid link" }),
});
