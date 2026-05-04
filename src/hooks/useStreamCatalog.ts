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
type StreamCatalogScope = "full" | "home";

const emptyState: CatalogState = {
  loading: false,
  source: "empty",
  error: null,
  items: [],
  sections: [],
};

const HOME_ENDPOINT_LIMIT = 8;
const cachedByScope = new Map<StreamCatalogScope, CatalogState>();
const pendingByScope = new Map<StreamCatalogScope, Promise<CatalogState>>();

const loadCatalog = async (scope: StreamCatalogScope): Promise<CatalogState> => {
  const cachedState = cachedByScope.get(scope);
  if (cachedState) return cachedState;
  const pendingRequest = pendingByScope.get(scope);
  if (pendingRequest) return pendingRequest;
  const endpointLimit = scope === "home" ? HOME_ENDPOINT_LIMIT : undefined;

  const nextPending = fetchStreamHome(endpointLimit)
    .then((result) => {
      if (result.items.length === 0 || result.sections.length === 0) {
        cachedByScope.set(scope, emptyState);
        return emptyState;
      }

      const nextState: CatalogState = {
        loading: false,
        source: "live",
        error: null,
        items: result.items,
        sections: result.sections,
      };
      cachedByScope.set(scope, nextState);

      return nextState;
    })
    .catch((error: unknown) => {
      const nextState: CatalogState = {
        ...emptyState,
        error: error instanceof Error ? error.message : "Unable to load live stream catalog.",
      };
      cachedByScope.set(scope, nextState);
      return nextState;
    })
    .finally(() => {
      pendingByScope.delete(scope);
    });

  pendingByScope.set(scope, nextPending);
  return nextPending;
};

export const useStreamCatalog = (options?: { scope?: StreamCatalogScope }) => {
  const scope = options?.scope ?? "full";
  const [state, setState] = useState<CatalogState>({
    ...emptyState,
    loading: true,
  });

  useEffect(() => {
    let mounted = true;

    loadCatalog(scope).then((nextState) => {
      if (mounted) setState(nextState);
    });

    return () => {
      mounted = false;
    };
  }, [scope]);

  return state;
};
