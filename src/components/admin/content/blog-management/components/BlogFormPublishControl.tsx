
import React from "react";
import { UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { BlogFormValues } from "../hooks/useBlogForm";

interface BlogFormPublishControlProps {
  form: UseFormReturn<BlogFormValues>;
}

const BlogFormPublishControl: React.FC<BlogFormPublishControlProps> = ({
  form,
}) => {
  return (
    <FormField
      control={form.control}
      name="is_published"
      render={({ field }) => (
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <FormLabel className="text-base">Опубликовать</FormLabel>
            <FormDescription>
              Запись будет видна посетителям сайта
            </FormDescription>
          </div>
          <FormControl>
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export default BlogFormPublishControl;
