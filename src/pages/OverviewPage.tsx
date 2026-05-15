import React from "react";
import { useParams, useNavigate, Link } from "react-router";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import {
  type Contestant,
  getContestantById,
  getContestantsByYear,
} from "@/lib/contestants";
import { useAppYear, buildRoomPath } from "@/lib/year";
import { useEurovisionUser } from "@/lib/hooks";
import { useHaptics } from "@/lib/haptics";
import { cn } from "@/lib/utils";
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type Column,
  type Row,
} from "@tanstack/react-table";
import { Globe, Users, ChevronUp, ChevronDown } from "lucide-react";

interface OverviewData {
  contestantId: string;
  avgMusic: number | null;
  avgPerformance: number | null;
  avgVibes: number | null;
  totalAvg: number | null;
  numRaters: number;
}

function formatScore(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return "—";
  }
  const formatted = value.toFixed(1);
  return formatted.endsWith(".0")
    ? formatted.substring(0, formatted.length - 2)
    : formatted;
}

function SortableHeader({
  column,
  children,
}: {
  column: Column<OverviewData, unknown>;
  children: React.ReactNode;
}) {
  const isSorted = column.getIsSorted();
  return (
    <button
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      className="flex items-center justify-center gap-0.5 w-full py-2 text-[10px] font-bold text-[#8a8a9a] uppercase tracking-wider hover:text-[#f0f0f5] transition-colors"
    >
      {children}
      {isSorted === "asc" && <ChevronUp className="size-3 text-[#f5b800]" />}
      {isSorted === "desc" && <ChevronDown className="size-3 text-[#f5b800]" />}
    </button>
  );
}

function getOrderValue(contestantId: string, year: number): number {
  const contestants = getContestantsByYear(year);
  const index = contestants.findIndex((c: Contestant) => c.id === contestantId);
  return index !== -1 ? index + 1 : Number.MAX_SAFE_INTEGER;
}

function getCellClass(columnId: string, cellValue: unknown): string {
  return cn(
    "px-1 py-2.5 text-sm text-center border-b border-white/[0.04]",
    columnId === "order" && "text-[#8a8a9a] font-semibold",
    columnId === "totalAvg" && "font-extrabold text-[#f5b800]",
    typeof cellValue === "number" && "font-bold text-[#f0f0f5]"
  );
}

function createColumns(year: number): ColumnDef<OverviewData>[] {
  return [
    {
      id: "order",
      header: ({ column }: { column: Column<OverviewData, unknown> }) => (
        <SortableHeader column={column}>#</SortableHeader>
      ),
      accessorFn: (row: OverviewData) => getOrderValue(row.contestantId, year),
      cell: (info) => {
        const orderValue = info.getValue<number>();
        return orderValue === Number.MAX_SAFE_INTEGER ? "—" : orderValue;
      },
      sortingFn: "alphanumeric",
    },
    {
      accessorKey: "contestantId",
      header: ({ column }: { column: Column<OverviewData, unknown> }) => (
        <SortableHeader column={column}>Flag</SortableHeader>
      ),
      cell: ({ row }: { row: Row<OverviewData> }) => {
        const contestant = getContestantById(row.original.contestantId, year);
        return contestant ? (
          <img
            src={contestant.flagUrl}
            alt={`${contestant.country} flag`}
            className="w-7 h-auto mx-auto rounded shadow-sm"
          />
        ) : (
          <span className="text-[#8a8a9a] text-xs">—</span>
        );
      },
      sortingFn: (rowA, rowB, columnId) => {
        const contestantA = getContestantById(rowA.getValue(columnId), year);
        const contestantB = getContestantById(rowB.getValue(columnId), year);
        const nameA = contestantA?.name.toLowerCase() ?? "";
        const nameB = contestantB?.name.toLowerCase() ?? "";
        return nameA.localeCompare(nameB);
      },
    },
    {
      accessorKey: "avgMusic",
      header: ({ column }: { column: Column<OverviewData, unknown> }) => (
        <SortableHeader column={column}>🎵</SortableHeader>
      ),
      cell: ({ row }: { row: Row<OverviewData> }) => (
        <span className="text-[#f5b800]">{formatScore(row.original.avgMusic)}</span>
      ),
    },
    {
      accessorKey: "avgPerformance",
      header: ({ column }: { column: Column<OverviewData, unknown> }) => (
        <SortableHeader column={column}>💃</SortableHeader>
      ),
      cell: ({ row }: { row: Row<OverviewData> }) => (
        <span className="text-[#ff2d78]">{formatScore(row.original.avgPerformance)}</span>
      ),
    },
    {
      accessorKey: "avgVibes",
      header: ({ column }: { column: Column<OverviewData, unknown> }) => (
        <SortableHeader column={column}>🧑‍🎤</SortableHeader>
      ),
      cell: ({ row }: { row: Row<OverviewData> }) => (
        <span className="text-[#22d3ee]">{formatScore(row.original.avgVibes)}</span>
      ),
    },
    {
      accessorKey: "totalAvg",
      header: ({ column }: { column: Column<OverviewData, unknown> }) => (
        <SortableHeader column={column}>Total</SortableHeader>
      ),
      cell: ({ row }: { row: Row<OverviewData> }) => (
        <span className="font-extrabold text-[#f5b800]">{formatScore(row.original.totalAvg)}</span>
      ),
    },
    {
      id: "numRaters",
      header: ({ column }: { column: Column<OverviewData, unknown> }) => (
        <SortableHeader column={column}>#V</SortableHeader>
      ),
      accessorKey: "numRaters",
      cell: (info) => (
        <span className="text-[#8a8a9a] text-xs font-semibold">{info.getValue<number>()}</span>
      ),
    },
  ];
}

const OverviewPage: React.FC = () => {
  const { roomName } = useParams<{ roomName: string }>();
  const navigate = useNavigate();
  const year = useAppYear();
  const contestants = getContestantsByYear(year);
  const { roomId: storedRoomId } = useEurovisionUser();
  const { trigger } = useHaptics();

  const roomOverviewQueryData = useQuery(
    api.ratings.getOverviewRatingsForRoom,
    storedRoomId ? { roomId: storedRoomId as Id<"rooms"> } : "skip",
  );

  const globalOverviewQueryData = useQuery(
    api.ratings.getGlobalOverviewRatings,
    {},
  );

  const yearContestantIds = new Set(contestants.map((c) => c.id));

  const roomDataForYear = (roomOverviewQueryData || []).filter((row) =>
    yearContestantIds.has(row.contestantId),
  );

  const globalDataForYear = (globalOverviewQueryData || []).filter((row) =>
    yearContestantIds.has(row.contestantId),
  );

  const [roomSorting, setRoomSorting] = React.useState<SortingState>([
    { id: "order", desc: false },
  ]);

  const [globalSorting, setGlobalSorting] = React.useState<SortingState>([
    { id: "totalAvg", desc: true },
  ]);

  const columns = React.useMemo(() => createColumns(year), [year]);

  const roomTable = useReactTable({
    data: roomDataForYear,
    columns,
    state: { sorting: roomSorting },
    onSortingChange: setRoomSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const globalTable = useReactTable({
    data: globalDataForYear,
    columns,
    state: { sorting: globalSorting },
    onSortingChange: setGlobalSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const TableView = ({
    table,
    emptyMessage,
  }: {
    table: ReturnType<typeof useReactTable<OverviewData>>;
    emptyMessage: string;
  }) => {
    const rows = table.getRowModel().rows;
    if (rows.length === 0) {
      return (
        <p className="text-center text-[#8a8a9a] text-sm py-8 font-medium">
          {emptyMessage}
        </p>
      );
    }

    const handleRowClick = (contestantId: string) => {
      trigger("light");
      void navigate(buildRoomPath(year, roomName || "", `/contestant/${contestantId}`));
    };

    return (
      <div className="overflow-x-auto -mx-4 px-4">
        <table className="w-full min-w-[340px]">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-white/[0.08]">
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-0.5">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="transition-colors hover:bg-white/[0.03] active:bg-white/[0.05] cursor-pointer"
                onClick={() => handleRowClick(row.original.contestantId)}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className={getCellClass(cell.column.id, cell.getValue())}
                  >
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext(),
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (!storedRoomId && globalOverviewQueryData === undefined) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-400 font-medium mb-4">Loading data...</p>
        <Link to="/" className="text-[#f5b800] font-semibold hover:underline">
          Re-join a room
        </Link>
      </div>
    );
  }

  return (
    <div className="py-5">
      {storedRoomId ? (
        <div className="pb-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-2 mb-5">
            <Users className="size-4 text-[#8a8a9a]" />
            <h1 className="text-lg font-extrabold tracking-tight text-[#f0f0f5]">
              {roomName} Scores
            </h1>
          </div>
          {roomOverviewQueryData === undefined ? (
            <p className="text-center text-[#8a8a9a] text-sm py-8">Loading room overview...</p>
          ) : (
            <TableView
              table={roomTable}
              emptyMessage="No ratings submitted yet for this room."
            />
          )}
        </div>
      ) : (
        <div className="pb-6 border-b border-white/[0.06]">
          <p className="text-[#f0f0f5] font-semibold mb-1">
            Room-specific averages are not available
          </p>
          <p className="text-[#8a8a9a] text-sm">
            You are not currently in a room.{" "}
            <Link to="/" className="text-[#f5b800] hover:underline font-medium">
              Join one
            </Link>
          </p>
        </div>
      )}

      <div className="py-6">
        <div className="flex items-center gap-2 mb-5">
          <Globe className="size-4 text-[#8a8a9a]" />
          <h1 className="text-lg font-extrabold tracking-tight text-[#f0f0f5]">
            Global Scores
          </h1>
        </div>
        {globalOverviewQueryData === undefined ? (
          <p className="text-center text-[#8a8a9a] text-sm py-8">Loading global overview...</p>
        ) : (
          <TableView
            table={globalTable}
            emptyMessage="No ratings submitted yet globally."
          />
        )}
      </div>
    </div>
  );
};

export default OverviewPage;
