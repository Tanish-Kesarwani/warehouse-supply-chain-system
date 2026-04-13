import type { ReactNode } from "react";
import { Card } from "./ui";

type Column<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
};

export function DataTable<T>({
  title,
  description,
  columns,
  rows,
  emptyMessage
}: {
  title: string;
  description?: string;
  columns: Column<T>[];
  rows: T[];
  emptyMessage: string;
}) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-white/10 px-5 py-4">
        <h3 className="font-display text-lg text-white">{title}</h3>
        {description ? <p className="mt-1 text-sm text-slate-400">{description}</p> : null}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-white/[0.03] text-slate-400">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-4 py-3 font-medium">
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-slate-400" colSpan={columns.length}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr key={index} className="border-t border-white/5 text-slate-200">
                  {columns.map((column) => (
                    <td key={column.key} className="px-4 py-3 align-top">
                      {column.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
