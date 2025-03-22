import { Client, Contract, User } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Mock database using in-memory storage
// In a real application, this would be replaced with a proper database

// Sample data
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@shortscut.com',
    role: 'admin',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  },
  {
    id: '2',
    name: 'Regular User',
    email: 'user@shortscut.com',
    role: 'user',
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-01-15'),
  },
];

const mockClients: Client[] = [
  {
    id: '1',
    name: 'Acme Corporation',
    email: 'contact@acme.com',
    phone: '555-123-4567',
    company: 'Acme Corporation',
    industry: 'Technology',
    address: '123 Main St, City, State, 12345',
    notes: 'Key client since 2022.',
    status: 'active',
    createdAt: new Date('2023-01-10'),
    updatedAt: new Date('2023-02-15'),
  },
  {
    id: '2',
    name: 'Global Labs',
    email: 'info@globallabs.com',
    phone: '555-987-6543',
    company: 'Global Labs',
    industry: 'Research',
    address: '456 Science Blvd, City, State, 67890',
    notes: 'Interested in expanding social media presence.',
    status: 'active',
    createdAt: new Date('2023-02-05'),
    updatedAt: new Date('2023-03-10'),
  },
  {
    id: '3',
    name: 'Northern Horizons',
    email: 'business@northernhorizons.com',
    phone: '555-456-7890',
    company: 'Northern Horizons',
    industry: 'Retail',
    address: '789 Commerce Ave, City, State, 54321',
    notes: 'Seasonal content planning required.',
    status: 'active',
    createdAt: new Date('2023-03-15'),
    updatedAt: new Date('2023-03-15'),
  },
  {
    id: '4',
    name: 'Sunrise Media',
    email: 'hello@sunrisemedia.com',
    phone: '555-789-0123',
    company: 'Sunrise Media',
    industry: 'Media',
    address: '321 Broadcast Lane, City, State, 09876',
    status: 'inactive',
    createdAt: new Date('2022-11-20'),
    updatedAt: new Date('2023-01-05'),
  },
  {
    id: '5',
    name: 'Tech Innovations',
    email: 'support@techinnovations.com',
    phone: '555-321-6547',
    company: 'Tech Innovations',
    industry: 'Technology',
    address: '654 Innovation Drive, City, State, 43210',
    notes: 'Looking for cutting-edge content.',
    status: 'active',
    createdAt: new Date('2023-04-01'),
    updatedAt: new Date('2023-04-01'),
  },
];

const mockContracts: Contract[] = [
  {
    id: '1',
    title: 'Social Media Campaign',
    clientId: '1',
    startDate: new Date('2023-01-15'),
    endDate: new Date('2023-03-15'),
    value: 5000,
    status: 'active',
    description: 'Comprehensive social media campaign across multiple platforms.',
    terms: 'Payment due within 30 days of invoice.',
    createdAt: new Date('2023-01-10'),
    updatedAt: new Date('2023-01-10'),
  },
  {
    id: '2',
    title: 'Brand Refresh',
    clientId: '2',
    startDate: new Date('2023-02-01'),
    endDate: new Date('2023-04-01'),
    value: 7500,
    status: 'active',
    description: 'Complete brand refresh including content strategy and execution.',
    terms: 'Payment in three installments.',
    createdAt: new Date('2023-01-25'),
    updatedAt: new Date('2023-01-25'),
  },
  {
    id: '3',
    title: 'Content Strategy',
    clientId: '3',
    startDate: new Date('2023-03-10'),
    endDate: new Date('2023-06-10'),
    value: 12000,
    status: 'active',
    description: 'Developing and implementing a comprehensive content strategy.',
    terms: 'Monthly billing with net-15 terms.',
    createdAt: new Date('2023-03-01'),
    updatedAt: new Date('2023-03-01'),
  },
  {
    id: '4',
    title: 'Marketing Campaign',
    clientId: '4',
    startDate: new Date('2022-11-01'),
    endDate: new Date('2023-01-31'),
    value: 6800,
    status: 'completed',
    description: 'Holiday marketing campaign for Q4 2022.',
    terms: 'Payment due upon completion.',
    createdAt: new Date('2022-10-15'),
    updatedAt: new Date('2023-02-05'),
  },
  {
    id: '5',
    title: 'Social Content Creation',
    clientId: '5',
    startDate: new Date('2023-04-01'),
    endDate: new Date('2023-09-30'),
    value: 9500,
    status: 'draft',
    description: 'Ongoing social media content creation and management.',
    terms: 'Monthly retainer with quarterly review.',
    createdAt: new Date('2023-03-20'),
    updatedAt: new Date('2023-03-20'),
  },
];

// In-memory database storage
let users = [...mockUsers];
let clients = [...mockClients];
let contracts = [...mockContracts];

// Database operations
export const db = {
  // User operations
  users: {
    getAll: () => [...users],
    getById: (id: string) => users.find(user => user.id === id) || null,
    getByEmail: (email: string) => users.find(user => user.email === email) || null,
    create: (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
      const newUser: User = {
        ...userData,
        id: uuidv4(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      users.push(newUser);
      return newUser;
    },
    update: (id: string, userData: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>) => {
      const index = users.findIndex(user => user.id === id);
      if (index === -1) return null;
      
      users[index] = {
        ...users[index],
        ...userData,
        updatedAt: new Date(),
      };
      return users[index];
    },
    delete: (id: string) => {
      const index = users.findIndex(user => user.id === id);
      if (index === -1) return false;
      
      users = users.filter(user => user.id !== id);
      return true;
    },
  },
  
  // Client operations
  clients: {
    getAll: () => [...clients],
    getById: (id: string) => clients.find(client => client.id === id) || null,
    create: (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
      const newClient: Client = {
        ...clientData,
        id: uuidv4(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      clients.push(newClient);
      return newClient;
    },
    update: (id: string, clientData: Partial<Omit<Client, 'id' | 'createdAt' | 'updatedAt'>>) => {
      const index = clients.findIndex(client => client.id === id);
      if (index === -1) return null;
      
      clients[index] = {
        ...clients[index],
        ...clientData,
        updatedAt: new Date(),
      };
      return clients[index];
    },
    delete: (id: string) => {
      const index = clients.findIndex(client => client.id === id);
      if (index === -1) return false;
      
      clients = clients.filter(client => client.id !== id);
      return true;
    },
  },
  
  // Contract operations
  contracts: {
    getAll: () => [...contracts],
    getById: (id: string) => contracts.find(contract => contract.id === id) || null,
    getByClientId: (clientId: string) => contracts.filter(contract => contract.clientId === clientId),
    create: (contractData: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>) => {
      const newContract: Contract = {
        ...contractData,
        id: uuidv4(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      contracts.push(newContract);
      return newContract;
    },
    update: (id: string, contractData: Partial<Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>>) => {
      const index = contracts.findIndex(contract => contract.id === id);
      if (index === -1) return null;
      
      contracts[index] = {
        ...contracts[index],
        ...contractData,
        updatedAt: new Date(),
      };
      return contracts[index];
    },
    delete: (id: string) => {
      const index = contracts.findIndex(contract => contract.id === id);
      if (index === -1) return false;
      
      contracts = contracts.filter(contract => contract.id !== id);
      return true;
    },
  },
}; 