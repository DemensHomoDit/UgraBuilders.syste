import { db } from "@/integrations/db/client";
import { NewsItem } from "./types";

const newsService = {
  async getNews(): Promise<NewsItem[]> {
    const { data, error } = await db
      .from("news")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data as NewsItem[]) || [];
  },

  async getNewsById(id: string): Promise<NewsItem | null> {
    const { data, error } = await db
      .from("news")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as NewsItem;
  },

  async createNews(item: Omit<NewsItem, "id" | "created_at" | "updated_at">): Promise<NewsItem> {
    const { data, error } = await db
      .from("news")
      .insert(item)
      .select()
      .single();

    if (error) throw error;
    return data as NewsItem;
  },

  async updateNews(
    id: string,
    item: Partial<NewsItem>,
  ): Promise<NewsItem> {
    const { data, error } = await db
      .from("news")
      .update({ ...item, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as NewsItem;
  },

  async deleteNews(id: string): Promise<boolean> {
    const { error } = await db.from("news").delete().eq("id", id);
    if (error) throw error;
    return true;
  },

  generateSlug(title: string): string {
    const map: Record<string, string> = {
      а: "a",
      б: "b",
      в: "v",
      г: "g",
      д: "d",
      е: "e",
      ё: "yo",
      ж: "zh",
      з: "z",
      и: "i",
      й: "y",
      к: "k",
      л: "l",
      м: "m",
      н: "n",
      о: "o",
      п: "p",
      р: "r",
      с: "s",
      т: "t",
      у: "u",
      ф: "f",
      х: "kh",
      ц: "ts",
      ч: "ch",
      ш: "sh",
      щ: "shch",
      ъ: "",
      ы: "y",
      ь: "",
      э: "e",
      ю: "yu",
      я: "ya",
    };
    return title
      .toLowerCase()
      .split("")
      .map((c) => map[c] ?? c)
      .join("")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  },
};

export default newsService;
