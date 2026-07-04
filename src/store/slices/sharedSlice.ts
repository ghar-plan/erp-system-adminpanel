import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SharedState {
  isLoading: boolean;
  token: string | null;
  userData: any | null;
  isSidebarExpanded: boolean;
}

const initialState: SharedState = {
  isLoading: false,
  token: null,
  userData: null,
  isSidebarExpanded: true,
};

const sharedSlice = createSlice({
  name: "shared",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    saveToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload;
    },

    saveUserData: (state, action: PayloadAction<any>) => {
      state.userData = action.payload;
    },

    setExpandSidebar: (state, action: PayloadAction<boolean>) => {
      state.isSidebarExpanded = action.payload;
    },

    logout: (state) => {
      state.token = null;
      state.userData = null;
      state.isLoading = false;
      // localStorage is cleared by redux-persist purge or we can dispatch PURGE
      // For now, simple state reset is enough as persist uses state
    },
  },
});

export const {
  setLoading,
  saveToken,
  saveUserData,
  setExpandSidebar,
  logout,
} = sharedSlice.actions;

export default sharedSlice.reducer;
