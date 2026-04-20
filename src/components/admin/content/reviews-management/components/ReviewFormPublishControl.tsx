
import React from "react";
import { useFormContext } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";

const ReviewFormPublishControl: React.FC = () => {
  const form = useFormContext();
  
  return (
    <FormField
      control={form.control}
      name="is_published"
      render={({ field }) => (
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <FormLabel className="text-base">Опубликовать</FormLabel>
            <div className="text-sm text-muted-foreground">
              Отзыв будет виден посетителям сайта
            </div>
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

export default ReviewFormPublishControl;
