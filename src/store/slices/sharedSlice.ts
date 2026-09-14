import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { SessionStatus } from '@/utils/helpers/permissions/types';

interface SharedState {
  isLoading: boolean;
  token: string | null;
  userData: any | null;
  isSidebarExpanded: boolean;
  sessionStatus: SessionStatus;
}

const initialState: SharedState = {
  isLoading: false,
  token: null,
  userData: null,
  isSidebarExpanded: true,
  sessionStatus: "idle",
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

    setSessionStatus: (state, action: PayloadAction<SessionStatus>) => {
      state.sessionStatus = action.payload;
    },

    logout: (state) => {
      state.token = null;
      state.userData = null;
      state.isLoading = false;
      state.sessionStatus = "idle";
    },
  },
});

export const {
  setLoading,
  saveToken,
  saveUserData,
  setExpandSidebar,
  setSessionStatus,
  logout,
} = sharedSlice.actions;

export default sharedSlice.reducer;
