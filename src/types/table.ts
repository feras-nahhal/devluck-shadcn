export type Column<T> = {
  header: React.ReactNode;
  cell: (row: T) => React.ReactNode;
  className?: string;
};

export type TableAction<T> =
  | {
      type: "button";
      label: string;
      onClick: (row: T) => void;
      variant?: "default" | "destructive";
    }
  | {
      type: "menu";
      items: {
        label: string;
        onClick: (row: T) => void;
        variant?: "default" | "destructive";
      }[];
    };