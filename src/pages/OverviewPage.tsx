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

interface OverviewData {
  contestantId: string;
  avgMusic: number | null;
  avgPerformance: number | null;
  avgVibes: number | null;
  totalAvg: number | null;
  numRaters: number;
}

const OverviewPage: React.FC = () => {
  const { roomName } = useParams<{ roomName: string }>();
  const navigate = useNavigate();
  const year = useAppYear();
  const contestants = getContestantsByYear(year);
  const storedRoomId = localStorage.getItem(
    "eurovisionRoomId",
  ) as Id<"rooms"> | null;

  const roomOverviewQueryData = useQuery(
    api.ratings.getOverviewRatingsForRoom,
    storedRoomId ? { roomId: storedRoomId } : "skip",
  );

  const globalOverviewQueryData = useQuery(
    api.ratings.getGlobalOverviewRatings,
    {},
  );

  const yearContestantIds = React.useMemo(
    () => new Set(contestants.map((c) => c.id)),
    [contestants],
  );

  const roomDataForYear = React.useMemo(
    () => (roomOverviewQueryData || []).filter((row) => yearContestantIds.has(row.contestantId)),
    [roomOverviewQueryData, yearContestantIds],
  );

  const globalDataForYear = React.useMemo(
    () => (globalOverviewQueryData || []).filter((row) => yearContestantIds.has(row.contestantId)),
    [globalOverviewQueryData, yearContestantIds],
  );

  const [roomSorting, setRoomSorting] = React.useState<SortingState>([
    { id: "order", desc: false },
  ]);

  const [globalSorting, setGlobalSorting] = React.useState<SortingState>([
    { id: "totalAvg", desc: true },
  ]);

  const columns: ColumnDef<OverviewData>[] = React.useMemo(
    () => [
      {
        id: "order",
        header: ({ column }: { column: Column<OverviewData, unknown> }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-1 hover:bg-gray-200/70 rounded-md w-full flex justify-center"
          >
            <div className="text-lg">🔢</div>
          </Button>
        ),
        accessorFn: (row: OverviewData) => {
          const contestantId = row.contestantId;
          const index = contestants.findIndex(
            (c: Contestant) => c.id === contestantId,
          );
          return index !== -1 ? index + 1 : Number.MAX_SAFE_INTEGER;
        },
        cell: (info) => {
          const orderValue = info.getValue<number>();
          return orderValue === Number.MAX_SAFE_INTEGER ? "N/A" : orderValue;
        },
        sortingFn: "alphanumeric",
      },
      {
        accessorKey: "contestantId",
        header: ({ column }: { column: Column<OverviewData, unknown> }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-1 hover:bg-gray-200/70 rounded-md w-full flex justify-center"
          >
            <div className="text-lg">🏳️</div>
          </Button>
        ),
        cell: ({ row }: { row: Row<OverviewData> }) => {
          const contestant = getContestantById(row.original.contestantId);
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
          const contestantA = getContestantById(rowA.getValue(columnId));
          const contestantB = getContestantById(rowB.getValue(columnId));
          const nameA = contestantA?.name.toLowerCase() ?? "";
          const nameB = contestantB?.name.toLowerCase() ?? "";
          return nameA.localeCompare(nameB);
        },
      },
      {
        accessorKey: "avgMusic",
        header: ({ column }: { column: Column<OverviewData, unknown> }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-1 hover:bg-gray-200/70 rounded-md w-full flex justify-center"
          >
            <div className="text-lg">🎵</div>
          </Button>
        ),
        cell: ({ row }: { row: Row<OverviewData> }) => {
          const value = row.original.avgMusic;
          if (value === null || value === undefined) {
            return "N/A";
          }
          const formatted = value.toFixed(1);
          return formatted.endsWith(".0")
            ? formatted.substring(0, formatted.length - 2)
            : formatted;
        },
      },
      {
        accessorKey: "avgPerformance",
        header: ({ column }: { column: Column<OverviewData, unknown> }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-1 hover:bg-gray-200/70 rounded-md w-full flex justify-center"
          >
            <div className="text-lg">💃</div>
          </Button>
        ),
        cell: ({ row }: { row: Row<OverviewData> }) => {
          const value = row.original.avgPerformance;
          if (value === null || value === undefined) {
            return "N/A";
          }
          const formatted = value.toFixed(1);
          return formatted.endsWith(".0")
            ? formatted.substring(0, formatted.length - 2)
            : formatted;
        },
      },
      {
        accessorKey: "avgVibes",
        header: ({ column }: { column: Column<OverviewData, unknown> }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-1 hover:bg-gray-200/70 rounded-md w-full flex justify-center"
          >
            <div className="text-lg">🧑‍🎤</div>
          </Button>
        ),
        cell: ({ row }: { row: Row<OverviewData> }) => {
          const value = row.original.avgVibes;
          if (value === null || value === undefined) {
            return "N/A";
          }
          const formatted = value.toFixed(1);
          return formatted.endsWith(".0")
            ? formatted.substring(0, formatted.length - 2)
            : formatted;
        },
      },
      {
        accessorKey: "totalAvg",
        header: ({ column }: { column: Column<OverviewData, unknown> }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-1 hover:bg-gray-200/70 rounded-md w-full flex justify-center"
          >
            <div className="text-lg">🟰</div>
          </Button>
        ),
        cell: ({ row }: { row: Row<OverviewData> }) => {
          const value = row.original.totalAvg;
          let displayValue: string;
          if (value === null || value === undefined) {
            displayValue = "N/A";
          } else {
            const formatted = value.toFixed(1);
            displayValue = formatted.endsWith(".0")
              ? formatted.substring(0, formatted.length - 2)
              : formatted;
          }
          return <span className="font-semibold">{displayValue}</span>;
        },
      },
      {
        id: "numRaters",
        header: ({ column }: { column: Column<OverviewData, unknown> }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-1 hover:bg-gray-200/70 rounded-md w-full flex justify-center"
          >
            <div className="text-lg">👥</div>
          </Button>
        ),
        accessorKey: "numRaters",
        cell: (info) => info.getValue<number>(),
      },
    ],
    [],
  );

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
    // Only show full block if not in a room AND global data is still loading
    // If global data HAS loaded, we can show that table even if not in a room.
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
      {storedRoomId && (
        <Card className="w-full max-w-4xl bg-white/90 shadow-xl py-2 gap-0">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold">
              {roomName} Scores
            </CardTitle>
          </CardHeader>
          <CardContent>
            {roomOverviewQueryData === undefined && (
              <p className="text-center text-gray-700">
                Loading room overview...
              </p>
            )}
            {roomOverviewQueryData && roomOverviewQueryData.length === 0 && (
              <p className="text-center text-gray-700">
                No ratings submitted yet for this room.
              </p>
            )}
            {roomOverviewQueryData && roomOverviewQueryData.length > 0 && (
              <div className="overflow-x-auto">
                <Table className="min-w-full">
                  <TableHeader>
                    {roomTable.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableHead
                            key={header.id}
                            className={cn(
                              "px-2 py-3 border-b border-gray-300 text-gray-800 font-semibold text-center",
                              header.column.id === "order"
                                ? "w-[8%]"
                                : header.column.id === "contestantId"
                                  ? "w-[12%]"
                                  : header.column.id === "totalAvg"
                                    ? "w-[12%]"
                                    : header.column.id === "numRaters"
                                      ? "w-[10%]"
                                      : "w-[13%]",
                            )}
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
                            className={cn(
                              "px-2 py-3 border-b border-gray-300 text-base text-center",
                              cell.column.id === "order" &&
                                "text-gray-800 font-medium",
                              cell.column.id === "totalAvg" &&
                                "font-bold text-green-700",
                              typeof cell.getValue() === "number" &&
                                "font-bold",
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
      )}
      {!storedRoomId && (
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
          {globalOverviewQueryData === undefined && (
            <p className="text-center text-gray-700">
              Loading global overview...
            </p>
          )}
          {globalOverviewQueryData && globalOverviewQueryData.length === 0 && (
            <p className="text-center text-gray-700">
              No ratings submitted yet globally.
            </p>
          )}
          {globalOverviewQueryData && globalOverviewQueryData.length > 0 && (
            <div className="overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader>
                  {globalTable.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead
                          key={header.id}
                          className={cn(
                            "px-2 py-3 border-b border-gray-300 text-gray-800 font-semibold text-center",
                            header.column.id === "order"
                              ? "w-[8%]"
                              : header.column.id === "contestantId"
                                ? "w-[12%]"
                                : header.column.id === "totalAvg"
                                  ? "w-[12%]"
                                  : header.column.id === "numRaters"
                                    ? "w-[10%]"
                                    : "w-[13%]",
                          )}
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
                          className={cn(
                            "px-2 py-3 border-b border-gray-300 text-base text-center",
                            cell.column.id === "order" &&
                              "text-gray-800 font-medium",
                            cell.column.id === "totalAvg" &&
                              "font-bold text-blue-700", // Changed color for differentiation
                            typeof cell.getValue() === "number" && "font-bold",
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
