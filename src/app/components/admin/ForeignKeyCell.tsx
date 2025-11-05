'use client';

import { useEffect, useRef, useState } from 'react';

interface TableData {
  name: string;
  count: number;
  data: Record<string, unknown>[];
}

interface ForeignKeyCellProps {
  id: string;
  tables: Record<string, TableData>;
}

/**
 * Resolves a foreign key ID to its corresponding name from the tables data.
 * Displays the name with a tooltip showing the actual ID on hover (1+ second delay).
 */
export function ForeignKeyCell({ id, tables }: ForeignKeyCellProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Map of column names to their corresponding table names
  const columnToTableMap: Record<string, string> = {
    city: 'cities',
    location: 'locations',
    trip: 'trips',
    tag: 'tags',
    owner: 'profiles',
  };

  // Try to find the name by searching through all tables
  let displayName: string | null = null;
  let foundTableName: string | null = null;

  // First, try to find in the mapped table
  for (const tableName of Object.values(columnToTableMap)) {
    if (tables[tableName]) {
      const record = tables[tableName].data.find(
        (r: Record<string, unknown>) => r.id === id
      );
      if (record) {
        const rec = record as Record<string, unknown>;
        displayName = (rec.name as string) || id;
        foundTableName = tableName;
        break;
      }
    }
  }

  // If not found, search through all tables
  if (!displayName) {
    for (const [tableName, tableData] of Object.entries(tables)) {
      const record = tableData.data.find(
        (r: Record<string, unknown>) => r.id === id
      );
      if (record) {
        const rec = record as Record<string, unknown>;
        displayName = (rec.name as string) || id;
        foundTableName = tableName;
        break;
      }
    }
  }

  // Fallback to ID if not found
  displayName = displayName || id;

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setShowTooltip(true);
    }, 1000);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setShowTooltip(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="relative inline-block">
      <span
        className="cursor-pointer underline decoration-dotted hover:text-blue-600 transition-colors"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {displayName}
      </span>
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50 bg-background text-foreground text-xs rounded-md px-3 py-2 whitespace-nowrap shadow-lg">
          <div className="font-mono text-xs break-all max-w-xs">{foundTableName} UUID: {id}</div>
          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-950"></div>
        </div>
      )}
    </div>
  );
}
