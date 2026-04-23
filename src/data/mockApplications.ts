export interface BusinessApplication {
  id: string;
  name: string;
  category: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  description: string;
  googleMapsUrl: string;
  submittedAt: string;
  status: 'pending' | 'verified' | 'rejected';
  lat: number;
  lng: number;
  imageUrl?: string;
}

export const MOCK_APPLICATIONS: BusinessApplication[] = [
  {
    id: 'app-1',
    name: 'QuickFix Plumbing Manila',
    category: 'Plumbing',
    address: '123 Mabini St, Ermita',
    city: 'Manila',
    country: 'Philippines',
    phone: '+63 912 345 6789',
    email: 'quickfix@email.ph',
    description: 'Emergency plumbing services available 24/7',
    googleMapsUrl: 'https://maps.google.com/?q=14.5995,120.9842',
    submittedAt: '2026-04-20T10:00:00Z',
    status: 'pending',
    lat: 14.5995,
    lng: 120.9842,
    imageUrl: '/fix.png',
  },
  {
    id: 'app-2',
    name: 'Berlin Tech Repair',
    category: 'Electronics',
    address: 'Friedrichstrasse 100',
    city: 'Berlin',
    country: 'Germany',
    phone: '+49 30 1234 5678',
    email: 'repair@berlintech.de',
    description: 'Phone and laptop repair service',
    googleMapsUrl: 'https://maps.google.com/?q=52.52,13.405',
    submittedAt: '2026-04-21T14:30:00Z',
    status: 'pending',
    lat: 52.52,
    lng: 13.405,
    imageUrl: '/fix.png',
  },
  {
    id: 'app-3',
    name: 'Nairobi Home Solutions',
    category: 'Home',
    address: 'Kenyatta Ave 45',
    city: 'Nairobi',
    country: 'Kenya',
    phone: '+254 712 345 678',
    email: 'info@nairobihome.co.ke',
    description: 'General home repairs and maintenance',
    googleMapsUrl: 'https://maps.google.com/?q=-1.286389,36.817223',
    submittedAt: '2026-04-22T09:15:00Z',
    status: 'verified',
    lat: -1.286389,
    lng: 36.817223,
    imageUrl: '/fix.png',
  },
];
