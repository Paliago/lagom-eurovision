import { Reflect } from "@rocicorp/reflect/client";
import c from "./scoreboard.module.css";
import { M } from "./state/mutators";

export default function Scoreboard({ r }: { r: Reflect<M> }) {
  return <div className={c.shell}>Scoreboard</div>;
}
