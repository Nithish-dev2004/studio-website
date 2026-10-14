// Custom 404 page, shown whenever a URL doesn't exist.

import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";

export default function NotFound() {
  return (
    <Container className="py-section flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="text-accent text-sm font-medium tracking-[0.3em] uppercase">
        Error 404
      </p>
      <h1 className="mt-4 text-5xl md:text-6xl">Page not found</h1>
      <p className="text-muted-foreground mt-4 max-w-md">
        The page you are looking for may have moved or never existed. Let&apos;s get you
        back to the photos.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button href="/">Back to Home</Button>
        <Button href="/portfolio" variant="outline">
          View Portfolio
        </Button>
      </div>
    </Container>
  );
}
