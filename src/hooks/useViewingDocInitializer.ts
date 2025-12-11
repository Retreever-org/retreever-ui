// useViewingDocInitializer.ts
import { useEffect } from "react";
import { viewingDocStore } from "../stores/viewing-doc-store";
import { getLastActiveTabKey } from "../storage/tab-order-storage";
import { getTabDoc } from "../storage/tab-doc-storage";
import { tabKeyToEndpoint } from "../services/tab-factory";

export const useViewingDocInitializer = () => {
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        console.log("resolving last viewed...");
        const lastKey = await getLastActiveTabKey();
        console.log("found lastKey: ", lastKey);
        if (!lastKey || cancelled) return;

        console.log("lastKey: ", lastKey);
        // load TabDoc to infer method/path if needed
        const tab = await getTabDoc(lastKey);
        if (cancelled || !tab) return;

        console.log("viewing doc: ", lastKey);
        const endpoint = tabKeyToEndpoint(lastKey); // or tabKeyToEndpoint(lastKey)
        if (!endpoint) return;

        // this will trigger subscribers: syncEndpointToTab will handle TabDoc
        viewingDocStore.setState({ endpoint });
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
