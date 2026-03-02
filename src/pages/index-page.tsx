import { Sidebar } from "../components/sidebar";

export function IndexPage() {
  return (
    <div>
      <Sidebar />
      <main className="flex-1 p-8 bg-base-200 min-h-screen">
        <h1>Hello, World!</h1>
      </main>
    </div>
  );
}
