import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Contract } from '../../types';

interface ContractsState {
  contracts: Contract[];
  selectedContract: Contract | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ContractsState = {
  contracts: [],
  selectedContract: null,
  isLoading: false,
  error: null,
};

const contractsSlice = createSlice({
  name: 'contracts',
  initialState,
  reducers: {
    fetchContractsStart(state) {
      state.isLoading = true;
      state.error = null;
    },
    fetchContractsSuccess(state, action: PayloadAction<Contract[]>) {
      state.isLoading = false;
      state.contracts = action.payload;
      state.error = null;
    },
    fetchContractsFailed(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.error = action.payload;
    },
    selectContract(state, action: PayloadAction<Contract>) {
      state.selectedContract = action.payload;
    },
    addContract(state, action: PayloadAction<Contract>) {
      state.contracts.push(action.payload);
    },
    updateContract(state, action: PayloadAction<Contract>) {
      const index = state.contracts.findIndex(contract => contract.id === action.payload.id);
      if (index !== -1) {
        state.contracts[index] = action.payload;
        if (state.selectedContract?.id === action.payload.id) {
          state.selectedContract = action.payload;
        }
      }
    },
    removeContract(state, action: PayloadAction<string>) {
      const id = action.payload;
      state.contracts = state.contracts.filter(contract => contract.id !== id);
      if (state.selectedContract?.id === id) {
        state.selectedContract = null;
      }
    },
  },
});

export const {
  fetchContractsStart,
  fetchContractsSuccess,
  fetchContractsFailed,
  selectContract,
  addContract,
  updateContract,
  removeContract,
} = contractsSlice.actions;

export const contractsReducer = contractsSlice.reducer; 