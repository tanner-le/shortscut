export type PackageType = 'creator' | 'studio';

export interface Package {
  type: PackageType;
  name: string;
  description: string;
  pricePerMonth: number;
  videosPerMonth: number;
  features: string[];
}

export const PACKAGES: Package[] = [
  {
    type: 'creator',
    name: 'Creator',
    description: 'Perfect for individual creators and small businesses',
    pricePerMonth: 1999,
    videosPerMonth: 4,
    features: [
      'Weekly strategy meeting',
      '4 short-form videos per month',
      'Content calendar',
      'Script writing',
      'Basic editing',
      'Platform optimization'
    ]
  },
  {
    type: 'studio',
    name: 'Studio',
    description: 'Comprehensive solution for businesses serious about content',
    pricePerMonth: 3999,
    videosPerMonth: 8,
    features: [
      'Biweekly strategy meeting',
      '8 short-form videos per month',
      'Content calendar',
      'Script writing',
      'Advanced editing',
      'Platform optimization',
      'Performance analytics',
      'Custom graphics',
      'Music licensing'
    ]
  }
]; 