import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Client } from '../../types';

interface ClientsState {
  clients: Client[];
  selectedClient: Client | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ClientsState = {
  clients: [],
  selectedClient: null,
  isLoading: false,
  error: null,
};

const clientsSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {
    fetchClientsStart(state) {
      state.isLoading = true;
      state.error = null;
    },
    fetchClientsSuccess(state, action: PayloadAction<Client[]>) {
      state.isLoading = false;
      state.clients = action.payload;
      state.error = null;
    },
    fetchClientsFailed(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.error = action.payload;
    },
    selectClient(state, action: PayloadAction<Client>) {
      state.selectedClient = action.payload;
    },
    addClient(state, action: PayloadAction<Client>) {
      state.clients.push(action.payload);
    },
    updateClient(state, action: PayloadAction<Client>) {
      const index = state.clients.findIndex(client => client.id === action.payload.id);
      if (index !== -1) {
        state.clients[index] = action.payload;
        if (state.selectedClient?.id === action.payload.id) {
          state.selectedClient = action.payload;
        }
      }
    },
    removeClient(state, action: PayloadAction<string>) {
      const id = action.payload;
      state.clients = state.clients.filter(client => client.id !== id);
      if (state.selectedClient?.id === id) {
        state.selectedClient = null;
      }
    },
  },
});

export const {
  fetchClientsStart,
  fetchClientsSuccess,
  fetchClientsFailed,
  selectClient,
  addClient,
  updateClient,
  removeClient,
} = clientsSlice.actions;

export const clientsReducer = clientsSlice.reducer; 