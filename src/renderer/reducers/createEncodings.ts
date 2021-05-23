import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";

// Define a type for the slice state
export interface CreateEncodingState {
  direcorySource: string;
}

// Define the initial state using that type
const initialState: CreateEncodingState = {
  direcorySource: "",
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
  },
});

export const { update } = counterSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectCount = (state: RootState) => state.createEncodings;

export default counterSlice.reducer;
