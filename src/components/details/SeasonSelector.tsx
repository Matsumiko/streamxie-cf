import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Season } from "@/types/content";

type SeasonSelectorProps = {
  seasons: Season[];
  selectedSeasonId: string;
  onSelect: (value: string) => void;
};

export const SeasonSelector = ({
  seasons,
  selectedSeasonId,
  onSelect,
}: SeasonSelectorProps) => {
  const seasonLabelId = "season-selector-label";

  return (
    <div className="max-w-xs">
      <label id={seasonLabelId} className="mb-2 block text-sm text-muted-foreground">Season</label>
      <Select value={selectedSeasonId} onValueChange={onSelect}>
        <SelectTrigger
          aria-labelledby={seasonLabelId}
          aria-label="Select season"
          className="h-10 border-border bg-input text-foreground"
        >
          <SelectValue placeholder="Select season" />
        </SelectTrigger>
        <SelectContent className="border-border bg-card text-card-foreground">
          {seasons.map((season) => (
            <SelectItem key={season.id} value={season.id}>
              {season.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
