"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import React from "react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { z } from "zod";
import { formSchema } from "../lib/schema";
import { useRouter } from "next/navigation";

const LinkInput = () => {
  const router = useRouter();

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    router.push(`/videos/${data.link.split("/").pop()}`);
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      link: "",
    },
  });
  return (
    <div className="flex gap-2 w-2/3">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-2 w-full">
          <FormField
            control={form.control}
            name="link"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Link</FormLabel>
                <FormControl>
                  <Input
                    className="w-full"
                    placeholder="https://www.youtube.com/shorts/1234567890"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <Button className="cursor-pointer" type="submit">
            Submit
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default LinkInput;
