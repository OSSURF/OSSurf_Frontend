export default function GsocPage() {
  return (
    <div className="flex-1 overflow-y-auto w-full bg-background font-geist">
      <section className="px-6 md:px-10 py-8 max-w-[1600px] mx-auto">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl tracking-tight font-serif-instrument">
              GSoC Organizations
            </h1>
            <p className="text-muted-foreground">
              Explore organizations participating in Google Summer of Code.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="h-[180px] w-full border rounded bg-muted/20 p-4"
              >
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  GSoC Org {i + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
