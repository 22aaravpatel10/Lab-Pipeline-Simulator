import * as React from "react";
import { cn } from "@/lib/utils";

interface TabsContextValue {
  value: string;
  setValue: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined);

export function Tabs({
  defaultValue,
  children
}: {
  defaultValue: string;
  children: React.ReactNode;
}) {
  const [value, setValue] = React.useState(defaultValue);
  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className="flex flex-col gap-6">{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="inline-flex flex-wrap gap-2 rounded-full border border-neutral-200 bg-white p-1">
      {children}
    </div>
  );
}

export function TabsTrigger({
  value,
  children
}: {
  value: string;
  children: React.ReactNode;
}) {
  const context = React.useContext(TabsContext);
  if (!context) return null;
  const isActive = context.value === value;
  return (
    <button
      type="button"
      onClick={() => context.setValue(value)}
      className={cn(
        "rounded-full px-4 py-2 text-sm font-medium transition",
        isActive
          ? "bg-terracotta text-white"
          : "text-neutral-600 hover:bg-neutral-100"
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({
  value,
  children
}: {
  value: string;
  children: React.ReactNode;
}) {
  const context = React.useContext(TabsContext);
  if (!context || context.value !== value) return null;
  return <div className="flex flex-col gap-6">{children}</div>;
}
