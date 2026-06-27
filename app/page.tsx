import { Suspense } from "react";
import { ModeToggle } from "@/components/mode-toggle";
import { Spinner } from "@/components/ui/spinner";
import { HomePageContent } from "@/features/home-page";

export default function Home() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col">
        <div className="flex items-center justify-between">
          <h1 className="font-bold text-2xl tracking-tight">Sigwa PH</h1>
          <ModeToggle />
        </div>
        <p className="text-base text-muted-foreground">
          Typhoon energy analytics for the Philippine Area of Responsibility,
          ranked by Accumulated Cyclone Energy (ACE).
        </p>
      </header>

      <Suspense
        fallback={
          <div className="mx-auto flex min-h-[50vh] items-center gap-2">
            <Spinner />
            <p className="text-muted-foreground text-sm">
              Gathering ACE analytics...
            </p>
          </div>
        }
      >
        <HomePageContent />
      </Suspense>
    </div>
  );
}
