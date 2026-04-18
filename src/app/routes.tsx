import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Home } from "./components/Home";
import { Tasks } from "./components/Tasks";
import { Stats } from "./components/Stats";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "tasks", Component: Tasks },
      { path: "stats", Component: Stats },
    ],
  },
]);
