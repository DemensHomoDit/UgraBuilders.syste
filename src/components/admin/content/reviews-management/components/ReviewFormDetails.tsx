
import React, { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ReviewRating from "./ReviewRating";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { db } from "@/integrations/db/client";
import { Project } from "@/services/project/types";

const ReviewFormDetails: React.FC = () => {
  const { control } = useFormContext();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoadingProjects(true);
      try {
        const { data, error } = await db
          .from('projects')
          .select('*')  // Fetch all fields to match the Project type
          .order('title');

        if (error) {
          console.error("Error fetching projects:", error);
        } else {
          setProjects(data as Project[] || []);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setIsLoadingProjects(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Заголовок отзыва</FormLabel>
            <FormControl>
              <Input placeholder="Введите заголовок отзыва" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="project_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Проект</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите проект (опционально)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="no-project">Без привязки к проекту</SelectItem>
                  {isLoadingProjects ? (
                    <SelectItem value="loading-projects">Загрузка проектов...</SelectItem>
                  ) : projects.length > 0 ? (
                    projects.map((project) => (
                      <SelectItem key={project.id} value={project.id || ''}>
                        {project.title}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-projects-found">Проекты не найдены</SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Оценка</FormLabel>
<FormControl>
                 <ReviewRating rating={field.value} interactive onChange={(v) => field.onChange(v)} />
               </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="content"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Текст отзыва</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Введите текст отзыва"
                className="min-h-[150px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default ReviewFormDetails;
