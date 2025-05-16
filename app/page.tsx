import DependencyGraph from "@/components/dependency-graph"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4">
      <div className="w-full max-w-7xl">
        <h1 className="text-3xl font-bold mb-6">Source Code Dependency Graph</h1>
        <p className="mb-8 text-muted-foreground">
          Interactive visualization of dependencies between files in a codebase. Drag nodes to rearrange, use the
          controls to zoom and pan, and click on nodes to highlight their dependencies.
        </p>
        <div className="h-[70vh] border rounded-lg overflow-hidden bg-white">
          <DependencyGraph />
        </div>
      </div>
    </main>
  )
}
