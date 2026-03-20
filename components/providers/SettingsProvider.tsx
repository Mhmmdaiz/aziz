"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";

interface Settings {
  store: any;
  appearance: any;
  payment: any;
  shipping: any;
  [key: string]: any;
}

const SettingsContext = createContext<{
  settings: Settings | null;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}>({
  settings: null,
  loading: true,
  refreshSettings: async () => {},
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    const { data } = await supabase.from("site_settings").select("*");
    if (data) {
      const mapped = data.reduce((acc: any, item: any) => {
        acc[item.key] = item.value;
        acc[`${item.key}_id`] = item.id;
        return acc;
      }, {});
      setSettings(mapped as Settings);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSettings();

    const channel = supabase
      .channel("site_settings_global")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "site_settings",
        },
        () => {
          fetchSettings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
