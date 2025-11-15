import "../global.css";
import { Slot } from "expo-router";
import { DatabaseProvider } from "../contexts/DatabaseContext";

export default function Layout() {
  return (
    <DatabaseProvider>
      <Slot />
    </DatabaseProvider>
  );
}
