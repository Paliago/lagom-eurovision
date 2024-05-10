import { Handler, LambdaFunctionURLEvent } from "aws-lambda";

type SuccessResponse<T> = {
  result: T;
};

// @ts-ignore error
type JSONValue =
  | null
  | string
  | boolean
  | number
  | Array<JSONValue>
  | JSONObject;
// @ts-ignore error
type JSONObject = Record<string, JSONValue>;
type GetRoomContentsResult = {
  contents: JSONObject;
};

export const handler: Handler<LambdaFunctionURLEvent> = async (evt) => {
  console.log("Checking room content");
  if (!process.env.REFLECT_API_KEY || !process.env.REFLECT_ID)
    throw new Error("Missing env vars");

  const roomId = evt.queryStringParameters?.roomId;

  if (!roomId) {
    return { message: "query param roomId required" };
  }

  const res = await fetch(
    `https://api.reflect-server.net/v1/apps/${process.env.REFLECT_ID}/rooms/contents?roomID=${roomId}`,
    {
      headers: { Authorization: `Basic ${process.env.REFLECT_API_KEY}` },
    },
  );

  if (res.status === 200) {
    const jsoned = (await res.json()) as SuccessResponse<GetRoomContentsResult>;
    return {
      result: jsoned.result.contents,
    };
  } else {
    throw new Error("Crashed when checking room content");
  }
};
