import { configureStore } from '@reduxjs/toolkit';
import surveyReducer from './surveySlice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      survey: surveyReducer,
    },
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
