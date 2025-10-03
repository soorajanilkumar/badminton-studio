import Image from 'next/image';
import CourtCommander from '@/app/court-commander';
import { Shuttlecock } from '@/components/icons';
import { placeholderImages } from '@/lib/placeholder-images';

export default function Home() {
  const heroImage = placeholderImages.find((img) => img.id === 'hero');
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="relative w-full h-48 md:h-64">
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            fill
            className="object-cover"
            priority
            data-ai-hint={heroImage.imageHint}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="flex items-center justify-center gap-4">
              <Shuttlecock className="w-12 h-12 md:w-16 md:h-16 text-primary" />
              <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tighter text-foreground">
                Baddies Doubles MatchMaker
              </h1>
            </div>
            <p className="text-muted-foreground mt-2 text-lg">
              Organize your badminton doubles matches with ease.
            </p>
          </div>
        </div>
      </header>
      <main className="flex-grow p-4 md:p-8 -mt-10">
        <CourtCommander />
      </main>
      <footer className="text-center p-4 text-muted-foreground text-sm">
        <p>Built for the love of the game.</p>
      </footer>
    </div>
  );
}
