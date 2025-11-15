import "../global.css";
import { Slot } from "expo-router";
import { useEffect } from "react";
import { initDatabase } from "../db";

export default function Layout() {
  useEffect(() => {
    // Khởi tạo database khi app start
    initDatabase();
  }, []);

  return <Slot />;
}
