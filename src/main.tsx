import { createRoot } from "react-dom/client";
import * as React from "react";
import { createBrowserRouter, RouterProvider, Link } from "react-router-dom";
import { Part1 } from "./parts/Part1";
import { Part2 } from "./parts/Part2";
import { Part3 } from "./parts/Part3";
import { Part3B } from "./parts/Part3B";
import { Part4 } from "./parts/Part4";

function Root() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="sticky top-0 z-20 flex items-center justify-between border-b bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-xl bg-gradient-to-tr from-indigo-500 to-fuchsia-500" />
          <span className="text-lg font-semibold">Choptop Admin — Demo Suite</span>
        </div>
        <nav className="flex flex-wrap gap-2 text-sm">
          <Link className="rounded-xl border px-3 py-2" to="/">Part 1</Link>
          <Link className="rounded-xl border px-3 py-2" to="/part2">Part 2</Link>
          <Link className="rounded-xl border px-3 py-2" to="/part3">Part 3</Link>
          <Link className="rounded-xl border px-3 py-2" to="/part3b">Part 3B</Link>
          <Link className="rounded-xl border px-3 py-2" to="/part4">Part 4</Link>
        </nav>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-4">
        <p className="text-xs text-gray-500">UI uses utility classes; Tailwind not required for demo.</p>
      </div>
    </div>
  );
}

const router = createBrowserRouter([
  { path: "/", element: <Part1/> },
  { path: "/part2", element: <Part2/> },
  { path: "/part3", element: <Part3/> },
  { path: "/part3b", element: <Part3B/> },
  { path: "/part4", element: <Part4/> },
]);

const root = createRoot(document.getElementById("root")!);
root.render(<RouterProvider router={router} />);
