import rows from "./generated/services.json";
import { asset } from "@/lib/asset";

export type ServiceCategory = "construction" | "developer" | "builder" | "design";

export interface Service {
  id: string;
  title: string;
  description: string;
  category: ServiceCategory;
  icon: string;
  sortOrder?: number;
  highlights?: string[];
  image?: string;
  deliverables?: string[];
}

const CATEGORY_ORDER: ServiceCategory[] = ["construction", "developer", "builder", "design"];

export function sortServices(list: Service[]): Service[] {
  return [...list].sort((a, b) => {
    const ca = CATEGORY_ORDER.indexOf(a.category);
    const cb = CATEGORY_ORDER.indexOf(b.category);
    if (ca !== cb) return ca - cb;
    return (a.sortOrder ?? 99) - (b.sortOrder ?? 99);
  });
}

export const services: Service[] = sortServices(
  (rows as Service[]).map((s) => ({ ...s, image: asset(s.image) })),
);

export function getServiceById(id: string): Service | undefined {
  return services.find((s) => s.id === id);
}
