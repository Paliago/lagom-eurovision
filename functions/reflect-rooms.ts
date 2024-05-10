type SuccessResponse<T> = {
  result: T;
};

type GetRoomResult = {
  roomID: string;
  jurisdiction: "" | "eu";
  status: "open" | "closed" | "deleted";
};

type ListRoomsResult = {
  results: GetRoomResult[];
  numResults: number;
  more: boolean;
};

export const handler = async () => {
  console.log("Checking rooms");
  if (!process.env.REFLECT_API_KEY || !process.env.REFLECT_ID)
    throw new Error("Missing env vars");

  const res = await fetch(
    `https://api.reflect-server.net/v1/apps/${process.env.REFLECT_ID}/rooms`,
    {
      headers: { Authorization: `Basic ${process.env.REFLECT_API_KEY}` },
    },
  );

  if (res.status === 200) {
    const jsoned = (await res.json()) as SuccessResponse<ListRoomsResult>;
    return {
      results: jsoned.result.results,
      totalRooms: jsoned.result.numResults,
    };
  } else {
    throw new Error("Crashed when checking rooms");
  }
};
