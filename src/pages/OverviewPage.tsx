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
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
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
import { cn } from "@/lib/utils";
import { useEurovisionUser } from "@/lib/hooks";

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
    return "N/A";
  }
  const formatted = value.toFixed(1);
  return formatted.endsWith(".0")
    ? formatted.substring(0, formatted.length - 2)
    : formatted;
}

function OrderHeader({ column }: { column: Column<OverviewData, unknown> }) {
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      className="p-1 hover:bg-gray-200/70 rounded-md w-full flex justify-center"
    >
      <div className="text-lg">🔢</div>
    </Button>
  );
}

function FlagHeader({ column }: { column: Column<OverviewData, unknown> }) {
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      className="p-1 hover:bg-gray-200/70 rounded-md w-full flex justify-center"
    >
      <div className="text-lg">🏳️</div>
    </Button>
  );
}

function ScoreHeader({
  column,
  icon,
}: {
  column: Column<OverviewData, unknown>;
  icon: string;
}) {
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      className="p-1 hover:bg-gray-200/70 rounded-md w-full flex justify-center"
    >
      <div className="text-lg">{icon}</div>
    </Button>
  );
}

function TotalHeader({ column }: { column: Column<OverviewData, unknown> }) {
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      className="p-1 hover:bg-gray-200/70 rounded-md w-full flex justify-center"
    >
      <div className="text-lg">🟰</div>
    </Button>
  );
}

function NumRatersHeader({ column }: { column: Column<OverviewData, unknown> }) {
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      className="p-1 hover:bg-gray-200/70 rounded-md w-full flex justify-center"
    >
      <div className="text-lg">👥</div>
    </Button>
  );
}

// Contestant lookup for columns — called at render time, not during table init
function getOrderValue(contestantId: string, year: number): number {
  const contestants = getContestantsByYear(year);
  const index = contestants.findIndex((c: Contestant) => c.id === contestantId);
  return index !== -1 ? index + 1 : Number.MAX_SAFE_INTEGER;
}

function getCellClass(columnId: string, cellValue: unknown): string {
  return cn(
    "px-2 py-3 border-b border-gray-300 text-base text-center",
    columnId === "order" && "text-gray-800 font-medium",
    columnId === "totalAvg" && "font-bold text-green-700",
    typeof cellValue === "number" && "font-bold",
  );
}

function getGlobalCellClass(columnId: string, cellValue: unknown): string {
  return cn(
    "px-2 py-3 border-b border-gray-300 text-base text-center",
    columnId === "order" && "text-gray-800 font-medium",
    columnId === "totalAvg" && "font-bold text-blue-700",
    typeof cellValue === "number" && "font-bold",
  );
}

function getHeadClass(columnId: string): string {
  return cn(
    "px-2 py-3 border-b border-gray-300 text-gray-800 font-semibold text-center",
    columnId === "order"
      ? "w-[8%]"
      : columnId === "contestantId"
        ? "w-[12%]"
        : columnId === "totalAvg"
          ? "w-[12%]"
          : columnId === "numRaters"
            ? "w-[10%]"
            : "w-[13%]",
  );
}

function createColumns(year: number): ColumnDef<OverviewData>[] {
  return [
    {
      id: "order",
      header: ({ column }: { column: Column<OverviewData, unknown> }) => (
        <OrderHeader column={column} />
      ),
      accessorFn: (row: OverviewData) => getOrderValue(row.contestantId, year),
      cell: (info) => {
        const orderValue = info.getValue<number>();
        return orderValue === Number.MAX_SAFE_INTEGER ? "N/A" : orderValue;
      },
      sortingFn: "alphanumeric",
    },
    {
      accessorKey: "contestantId",
      header: ({ column }: { column: Column<OverviewData, unknown> }) => (
        <FlagHeader column={column} />
      ),
      cell: ({ row }: { row: Row<OverviewData> }) => {
        const contestant = getContestantById(row.original.contestantId, year);
        return contestant ? (
          <img
            src={contestant.flagUrl}
            alt={`${contestant.country} flag`}
            className="w-8 h-auto mx-auto"
          />
        ) : (
          row.original.contestantId
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
        <ScoreHeader column={column} icon="🎵" />
      ),
      cell: ({ row }: { row: Row<OverviewData> }) => formatScore(row.original.avgMusic),
    },
    {
      accessorKey: "avgPerformance",
      header: ({ column }: { column: Column<OverviewData, unknown> }) => (
        <ScoreHeader column={column} icon="💃" />
      ),
      cell: ({ row }: { row: Row<OverviewData> }) => formatScore(row.original.avgPerformance),
    },
    {
      accessorKey: "avgVibes",
      header: ({ column }: { column: Column<OverviewData, unknown> }) => (
        <ScoreHeader column={column} icon="🧑‍🎤" />
      ),
      cell: ({ row }: { row: Row<OverviewData> }) => formatScore(row.original.avgVibes),
    },
    {
      accessorKey: "totalAvg",
      header: ({ column }: { column: Column<OverviewData, unknown> }) => (
        <TotalHeader column={column} />
      ),
      cell: ({ row }: { row: Row<OverviewData> }) => (
        <span className="font-semibold">{formatScore(row.original.totalAvg)}</span>
      ),
    },
    {
      id: "numRaters",
      header: ({ column }: { column: Column<OverviewData, unknown> }) => (
        <NumRatersHeader column={column} />
      ),
      accessorKey: "numRaters",
      cell: (info) => info.getValue<number>(),
    },
  ];
}

const OverviewPage: React.FC = () => {
  const { roomName } = useParams<{ roomName: string }>();
  const navigate = useNavigate();
  const year = useAppYear();
  const contestants = getContestantsByYear(year);
  const { roomId: storedRoomId } = useEurovisionUser();

  const roomOverviewQueryData = useQuery(
    api.ratings.getOverviewRatingsForRoom,
    storedRoomId ? { roomId: storedRoomId as Id<"rooms"> } : "skip",
  );

  const globalOverviewQueryData = useQuery(
    api.ratings.getGlobalOverviewRatings,
    {},
  );

  // Simple Set creation — no need for useMemo (rerender-simple-expression-in-memo)
  const yearContestantIds = new Set(contestants.map((c) => c.id));

  // Simple filter operations — no need for useMemo
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

  // Columns are recreated when year changes, but extracted outside component logic
  const columns = React.useMemo(() => createColumns(year), [year]);

  const roomTable = useReactTable({
    data: roomDataForYear,
    columns,
    state: {
      sorting: roomSorting,
    },
    onSortingChange: setRoomSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const globalTable = useReactTable({
    data: globalDataForYear,
    columns,
    state: {
      sorting: globalSorting,
    },
    onSortingChange: setGlobalSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (!storedRoomId && globalOverviewQueryData === undefined) {
    return (
      <div className="p-4 text-red-500">
        Loading data or not in a room. Please wait or{" "}
        <Button variant="link" asChild>
          <Link to="/">re-join a room</Link>
        </Button>
        .
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {storedRoomId ? (
        <Card className="w-full max-w-4xl bg-white/90 shadow-xl py-2 gap-0">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold">
              {roomName} Scores
            </CardTitle>
          </CardHeader>
          <CardContent>
            {roomOverviewQueryData === undefined ? (
              <p className="text-center text-gray-700">
                Loading room overview...
              </p>
            ) : roomOverviewQueryData.length === 0 ? (
              <p className="text-center text-gray-700">
                No ratings submitted yet for this room.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table className="min-w-full">
                  <TableHeader>
                    {roomTable.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableHead
                            key={header.id}
                            className={getHeadClass(header.column.id)}
                          >
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {roomTable.getRowModel().rows.map((row) => (
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell
                            key={cell.id}
                            className={getCellClass(
                              cell.column.id,
                              cell.getValue(),
                            )}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="p-4 text-orange-600 text-center bg-orange-100 border border-orange-300 rounded-md shadow-md w-full max-w-4xl">
          <p className="font-semibold">
            Room-specific averages are not available.
          </p>
          <p>
            You are not currently in a room. You can view global averages below,
            or join/create a room from the{" "}
            <Link
              to="/"
              className="underline text-purple-700 hover:text-purple-900"
            >
              homepage
            </Link>
            .
          </p>
        </div>
      )}

      {/* Global Averages Card */}
      <Card className="w-full max-w-4xl bg-white/90 shadow-xl py-2 gap-0">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            Global Scores
          </CardTitle>
        </CardHeader>
        <CardContent>
          {globalOverviewQueryData === undefined ? (
            <p className="text-center text-gray-700">
              Loading global overview...
            </p>
          ) : globalOverviewQueryData.length === 0 ? (
            <p className="text-center text-gray-700">
              No ratings submitted yet globally.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader>
                  {globalTable.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead
                          key={header.id}
                          className={getHeadClass(header.column.id)}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {globalTable.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className={getGlobalCellClass(
                            cell.column.id,
                            cell.getValue(),
                          )}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <div>
        <Button
          variant="secondary"
          onClick={() => {
            void navigate(
              roomName ? buildRoomPath(year, roomName, "/contestants") : "/",
            );
          }}
          className="w-full"
        >
          Back to Contestant List
        </Button>
      </div>
    </div>
  );
};

export default OverviewPage;
