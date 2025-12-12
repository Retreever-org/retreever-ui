// useViewingDocInitializer.ts
import { useEffect } from "react";
import { useViewingDocStore } from "../stores/viewing-doc-store";
import { getLastActiveTabKey } from "../storage/tab-order-storage";
import { getTabDoc } from "../storage/tab-doc-storage";
import { tabKeyToEndpoint } from "../services/tab-factory";
import { useDocStore } from "../stores/doc-store";

export const useViewingDocInitializer = () => {
  const { setEndpoint } = useViewingDocStore();
  const { doc } = useDocStore();

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const lastKey = await getLastActiveTabKey();
        if (!lastKey || cancelled) return;

        // load TabDoc to infer method/path if needed
        const tab = await getTabDoc(lastKey);
        if (cancelled || !tab) return;

        const endpoint = tabKeyToEndpoint(lastKey, doc); // or tabKeyToEndpoint(lastKey)
        if (!endpoint) return;
        
        // triggers subscribers: syncEndpointToTab will handle TabDoc
        setEndpoint(endpoint);
      } catch (e) {
        console.error("ViewingDoc init failed", e);
      }
    };

    void init();

    return () => {
      cancelled = true;
    };
  }, []);
};
