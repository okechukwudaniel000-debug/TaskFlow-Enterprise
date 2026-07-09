/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { forwardRef } from "react";

export const TableContainer = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <div 
        ref={ref} 
        className={`w-full overflow-x-auto rounded-lg border border-neutral-800 bg-black/20 scrollbar-thin ${className}`} 
        {...props}
      >
        {children}
      </div>
    );
  }
);

TableContainer.displayName = "TableContainer";

export const Table = forwardRef<HTMLTableElement, React.TableHTMLAttributes<HTMLTableElement>>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <table 
        ref={ref} 
        className={`w-full border-collapse text-left text-xs text-neutral-300 ${className}`} 
        {...props}
      >
        {children}
      </table>
    );
  }
);

Table.displayName = "Table";

export const TableHeader = forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <thead 
        ref={ref} 
        className={`bg-[#111111] border-b border-neutral-800/80 font-mono text-[10px] tracking-wider text-zinc-500 uppercase font-bold shrink-0 ${className}`} 
        {...props}
      >
        {children}
      </thead>
    );
  }
);

TableHeader.displayName = "TableHeader";

export const TableBody = forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <tbody 
        ref={ref} 
        className={`divide-y divide-neutral-900 bg-transparent ${className}`} 
        {...props}
      >
        {children}
      </tbody>
    );
  }
);

TableBody.displayName = "TableBody";

export const TableRow = forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <tr 
        ref={ref} 
        className={`transition-colors hover:bg-neutral-950/40 ${className}`} 
        {...props}
      >
        {children}
      </tr>
    );
  }
);

TableRow.displayName = "TableRow";

export const TableHead = forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <th 
        ref={ref} 
        className={`px-4.5 py-3 font-semibold select-none ${className}`} 
        {...props}
      >
        {children}
      </th>
    );
  }
);

TableHead.displayName = "TableHead";

export const TableCell = forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <td 
        ref={ref} 
        className={`px-4.5 py-3.5 align-middle truncate max-w-[280px] ${className}`} 
        {...props}
      >
        {children}
      </td>
    );
  }
);

TableCell.displayName = "TableCell";
