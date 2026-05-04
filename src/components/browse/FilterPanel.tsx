import { Dispatch, SetStateAction } from "react";
import { FunnelSimple } from "@phosphor-icons/react";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type BrowseFilters = {
  genre: string;
  year: string;
  type: string;
  country: string;
  status: string;
  provider: string;
  sort: string;
};

type FilterPanelProps = {
  filters: BrowseFilters;
  setFilters: Dispatch<SetStateAction<BrowseFilters>>;
  options?: {
    genres: string[];
    years: string[];
    countries: string[];
    statuses: string[];
    contentTypes: string[];
    providers: string[];
    sortOptions: string[];
  };
};

export const FilterPanel = ({ filters, setFilters, options }: FilterPanelProps) => {
  const resolvedOptions = options ?? {
    genres: [],
    years: [],
    countries: [],
    statuses: [],
    contentTypes: ["Movies", "Series"],
    providers: [],
    sortOptions: ["Popularity", "Latest", "Rating"],
  };

  const fields = [
    { key: "genre", label: "Genre", values: resolvedOptions.genres, allowAll: true },
    { key: "year", label: "Year", values: resolvedOptions.years, allowAll: true },
    { key: "type", label: "Type", values: resolvedOptions.contentTypes, allowAll: true },
    { key: "country", label: "Bahasa asli", values: resolvedOptions.countries, allowAll: true },
    { key: "status", label: "Status rilis", values: resolvedOptions.statuses, allowAll: true },
    { key: "provider", label: "Provider", values: resolvedOptions.providers, allowAll: true },
    { key: "sort", label: "Sort by", values: resolvedOptions.sortOptions, allowAll: false },
  ] as const;

  return (
    <Card className="rounded-lg border border-border bg-card p-6">
      <div className="mb-5 flex items-center gap-3">
        <FunnelSimple size={32} weight="duotone" className="text-primary" />
        <h2 className="text-xl font-medium text-foreground">Filters</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {fields.map((field) => (
          <div key={field.key} className="space-y-2">
            <label className="text-sm text-muted-foreground">
              {field.label}
            </label>
            <Select
              value={filters[field.key]}
              onValueChange={(value) =>
                setFilters((current) => ({ ...current, [field.key]: value }))
              }
            >
              <SelectTrigger className="border-border bg-input text-foreground">
                <SelectValue placeholder={`All ${field.label}`} />
              </SelectTrigger>
              <SelectContent className="border-border bg-card text-card-foreground">
                {field.allowAll ? <SelectItem value="All">All</SelectItem> : null}
                {field.values.map((value) => (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>
    </Card>
  );
};
