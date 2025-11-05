import {
  MapPin,
  Utensils,
  Sparkles,
  Navigation,
  MessageCircle,
  Clock,
  LucideIcon,
} from 'lucide-react';

type FeatureItem = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const features: FeatureItem[] = [
  {
    icon: MapPin,
    title: 'Smart Route Planning',
    description:
      'AI-optimized itineraries that show you the best locations in the perfect order, saving time and maximizing your experience.',
  },
  {
    icon: Utensils,
    title: 'Local Restaurant Finder',
    description:
      'Discover authentic restaurants where locals actually eat, with personalized recommendations based on your preferences.',
  },
  {
    icon: Sparkles,
    title: 'AI Travel Assistant',
    description:
      'Get instant answers to any travel question, from monument history to activity recommendations, 24/7.',
  },
  {
    icon: Navigation,
    title: 'Explore Surroundings',
    description:
      'Intelligently discover hidden gems and attractions near you, curated specifically for your interests.',
  },
  {
    icon: MessageCircle,
    title: 'Real-Time Support',
    description:
      'Ask questions about your current trip or specific activities. Our AI is always there to help you make the most of it.',
  },
  {
    icon: Clock,
    title: 'Personalized Pace',
    description:
      'Travel at your own rhythm with flexible itineraries that adapt to your preferences and energy levels.',
  },
];

const FeatureCard = ({ feature }: { feature: FeatureItem }) => {
  const Icon = feature.icon;

  return (
    <div className="group relative rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/5 to-transparent p-6 transition-all hover:border-primary/30 hover:bg-primary/10">
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 transition-opacity group-hover:opacity-100" />
      
      <div className="relative">
        <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {feature.description}
        </p>
      </div>
    </div>
  );
};

export default function Features() {
  return (
    <section className="py-20 bg-transparent" id="features">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Features</span>
          </div>
          <h2 className="mb-4 text-4xl font-bold md:text-5xl">
            Everything You Need for Perfect Travels
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            PocketGuide combines AI intelligence with local expertise to transform how you explore the world.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
