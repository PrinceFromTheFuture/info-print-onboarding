import { configureStore } from "@reduxjs/toolkit";
import { formReducer } from "./formSlice/formSlice";
import { ticketsReducer } from "./ticketsSlice/ticketsSlice";

const store = configureStore({
  reducer: {
    form: formReducer,
    tickets: ticketsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
