"use client";


import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
type TableAction<T> =
  | {
      type: "button";
      label: string;
      onClick: (row: T) => void;
    }
  | {
      type: "menu";
      items: {
        label: string | ((row: T) => string);
        icon?: React.ReactNode;
        onClick: (row: T) => void;
        variant?: "default" | "destructive";
        hidden?: (row: T) => boolean; // ✅ ADD THIS
      }[];
    };
type Props<T> = {
  data: T[];
  columns: any[];
  getId: (row: T) => string;

  selectable?: boolean;
  selectedIds?: string[];
  onSelect?: (ids: string[]) => void;

  onRowClick?: (row: T) => void;

  actions?: TableAction<T>;
};

export function DataTable<T>({
  data,
  columns,
  getId,
  selectable = false,
  selectedIds = [],
  onSelect,
  onRowClick,
  actions,
}: Props<T>) {
  const toggleSelectAll = (checked: boolean) => {
    if (!onSelect) return;

    onSelect(checked ? data.map(getId) : []);
  };

  const toggleRow = (id: string, checked: boolean) => {
    if (!onSelect) return;

    onSelect(
      checked
        ? [...selectedIds, id]
        : selectedIds.filter((x) => x !== id)
    );
  };

  return (
    <div className="border rounded-md">
      <Table>
        {/* HEADER */}
        <TableHeader>
          <TableRow>
            {selectable && (
              <TableHead className="w-10">
                <Checkbox
                  checked={
                    selectedIds.length === data.length && data.length > 0
                  }
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
            )}

            {columns.map((col, i) => (
              <TableHead key={i}>{col.header}</TableHead>
            ))}

            {actions && (
              <TableHead className="text-right">Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>

        {/* BODY */}
        <TableBody>
          {data.map((row) => {
            const id = getId(row);
            const isSelected = selectedIds.includes(id);

            return (
              <TableRow
                key={id}
                className={isSelected ? "bg-muted/40" : ""}
                onClick={() => onRowClick?.(row)}
              >
                {/* SELECT */}
                {selectable && (
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(v) => toggleRow(id, !!v)}
                    />
                  </TableCell>
                )}

                {/* COLUMNS */}
                {columns.map((col, i) => (
                  <TableCell key={i} className={col.className}>
                    {col.cell(row)}
                  </TableCell>
                ))}

                {/* ACTIONS */}
                  {actions && (
                    <TableCell
                      className="text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* BUTTON MODE */}
                      {actions.type === "button" && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => actions.onClick(row)}
                        >
                          {actions.label}
                        </Button>
                      )}

                      {/* MENU MODE */}
                      {actions.type === "menu" && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end">
                            {actions.items
                            .filter((item) => !item.hidden?.(row)) // ✅ filter per row
                            .map((item, i) => (
                              <DropdownMenuItem
                                key={i}
                                onClick={() => item.onClick(row)}
                                className={cn(
                                  item.variant === "destructive" &&
                                    "text-destructive"
                                )}
                              >
                                {item.icon && (
                                  <span className="mr-2">{item.icon}</span>
                                )}
                                {typeof item.label === "function" ? item.label(row) : item.label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}