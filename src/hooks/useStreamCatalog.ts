import { useEffect, useState } from "react";
import type { ContentItem } from "@/types/content";
import { fetchStreamHome, type StreamHomeSection } from "@/lib/streamxie";

type CatalogState = {
  loading: boolean;
  source: "live" | "empty";
  error: string | null;
  items: ContentItem[];
  sections: StreamHomeSection[];
};

const emptyState: CatalogState = {
  loading: false,
  source: "empty",
  error: null,
  items: [],
  sections: [],
};

let cachedState: CatalogState | null = null;
let pendingRequest: Promise<CatalogState> | null = null;

const loadCatalog = async (): Promise<CatalogState> => {
  if (cachedState) return cachedState;
  if (pendingRequest) return pendingRequest;

  pendingRequest = fetchStreamHome()
    .then((result) => {
      if (result.items.length === 0 || result.sections.length === 0) {
        cachedState = emptyState;
        return emptyState;
      }

      cachedState = {
        loading: false,
        source: "live",
        error: null,
        items: result.items,
        sections: result.sections,
      };

      return cachedState;
    })
    .catch((error: unknown) => {
      cachedState = {
        ...emptyState,
        error: error instanceof Error ? error.message : "Unable to load live stream catalog.",
      };
      return cachedState;
    })
    .finally(() => {
      pendingRequest = null;
    });

  return pendingRequest;
};

export const useStreamCatalog = () => {
  const [state, setState] = useState<CatalogState>({
    ...emptyState,
    loading: true,
  });

  useEffect(() => {
    let mounted = true;

    loadCatalog().then((nextState) => {
      if (mounted) setState(nextState);
    });

    return () => {
      mounted = false;
    };
  }, []);

  return state;
};
