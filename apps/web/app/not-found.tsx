import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/container";

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p className="bg-gradient-to-b from-foreground/80 to-foreground/10 bg-clip-text text-8xl font-semibold tracking-tighter text-transparent sm:text-9xl">
        404
      </p>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">Page not found</h1>
      <p className="mt-2 text-muted-foreground">That page doesn&apos;t exist or has been moved.</p>
      <div className="mt-8 flex gap-3">
        <Button asChild>
          <Link href="/">Go home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/blog/">Browse posts</Link>
        </Button>
      </div>
    </Container>
  );
}
