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
import apiClient from "@/utils/axios";

const LinkInput = () => {
  const router = useRouter();

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const response = await apiClient.post(`/api/videos/${data.link.split("/").pop()}`);
    console.log("Response:", response);
    if (response.status === 200) {
      router.push(`/videos/${data.link.split("/").pop()}`);
    } else {
      console.error("Error fetching video:", response.data);
    }
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      link: "",
    },
  });
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full w-full">
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
  );
};

export default LinkInput;
