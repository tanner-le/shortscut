export type PackageType = 'creator' | 'studio';

export interface Package {
  id: string;
  name: string;
  type: PackageType;
  pricePerMonth: number;
  videosPerMonth: number;
  features: string[];
  description?: string;
}

export const PACKAGES: Package[] = [
  {
    id: 'creator-package',
    name: 'Creator Package',
    type: 'creator',
    pricePerMonth: 5000,
    videosPerMonth: 8,
    features: [
      'Concepts and scripts',
      'Video editing',
      'Unlimited revisions',
      'Monthly sync call',
    ],
    description: 'Basic package for content creators looking to scale their video production.'
  },
  {
    id: 'studio-package',
    name: 'Studio Package',
    type: 'studio',
    pricePerMonth: 10000,
    videosPerMonth: 16,
    features: [
      'Concepts and scripts',
      'Video editing',
      'Unlimited revisions',
      'Monthly sync call',
    ],
    description: 'Advanced package for businesses needing a higher volume of content.'
  }
]; 