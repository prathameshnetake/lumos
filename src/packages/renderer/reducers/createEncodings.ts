import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";

// Define a type for the slice state
export interface CreateEncodingState {
  direcorySource: string;
  currentTip: string;
  indexingStarted: boolean;
  finished: boolean;
  recentSessionId: string;
  progress: number;
  sessionName: string;
}

// Define the initial state using that type
const initialState: CreateEncodingState = {
  direcorySource: "",
  currentTip:
    "this is test tip which can be so long in terms of the length and can do lot of other things in parallel world",
  indexingStarted: false,
  finished: false,
  recentSessionId: "",
  progress: 0,
  sessionName: "",
};

export const counterSlice = createSlice({
  name: "counter",
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    // Use the PayloadAction type to declare the contents of `action.payload`
    update: (state, action: PayloadAction<string>) => {
      state.direcorySource = action.payload;
    },
    updateCurrentTip: (state, action: PayloadAction<string>) => {
      state.currentTip = action.payload;
    },
    updateIndexingStarted: (state, action: PayloadAction<boolean>) => {
      state.indexingStarted = action.payload;
    },
    updateFinished: (state, action: PayloadAction<boolean>) => {
      state.finished = action.payload;
    },
    updateRecentSessionId: (state, action: PayloadAction<string>) => {
      state.recentSessionId = action.payload;
    },
    updateProgress: (state, action: PayloadAction<number>) => {
      state.progress = action.payload;
    },
    updateSessionName: (state, action: PayloadAction<string>) => {
      state.sessionName = action.payload;
    },
  },
});

export const {
  update,
  updateIndexingStarted,
  updateCurrentTip,
  updateFinished,
  updateRecentSessionId,
  updateProgress,
  updateSessionName,
} = counterSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectCount = (state: RootState) => state.createEncodings;

export default counterSlice.reducer;
