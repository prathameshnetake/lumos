import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";

// Define a type for the slice state
import { SessionBlob } from "../../electron/DB/session";
import { FaceBlob } from "../../electron/DB/face";

export interface CreateEncodingState {
  sessions: SessionBlob[];
  selectedFile: string;
  currentSession: SessionBlob | null;
  currentFaces: string[];
  currentMatches: FaceBlob[];
  fetchingMatches: boolean;
}

// Define the initial state using that type
const initialState: CreateEncodingState = {
  sessions: [],
  selectedFile: "",
  currentSession: null,
  currentFaces: [],
  currentMatches: [],
  fetchingMatches: false,
};

export const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    updateSessions: (state, action: PayloadAction<SessionBlob[]>) => {
      state.sessions = action.payload;

      // if (!state.currentSession && action.payload.length) {
      //   state.currentSession = action.payload[0];
      // }
    },
    updateSelectedFile: (state, action: PayloadAction<string>) => {
      state.selectedFile = action.payload;
    },
    updateCurrentFaces: (state, action: PayloadAction<string[]>) => {
      state.currentFaces = action.payload;
    },
    updateCurrentSession: (state, action: PayloadAction<SessionBlob>) => {
      state.currentSession = action.payload;
    },
    updateCurrectMatches: (state, action: PayloadAction<FaceBlob[]>) => {
      state.currentMatches = action.payload;
    },
    updateFetchingMatches: (state, action: PayloadAction<boolean>) => {
      state.fetchingMatches = action.payload;
    },
  },
});

export const {
  updateSessions,
  updateSelectedFile,
  updateCurrentFaces,
  updateCurrentSession,
  updateCurrectMatches,
  updateFetchingMatches,
} = searchSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectCount = (state: RootState) => state.search;

export default searchSlice.reducer;
