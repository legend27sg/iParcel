import { Reducer } from 'react-native-router-flux';
export default reducerCreate = params => {
  const defaultReducer = Reducer(params);
  return (state, action) => {
    return defaultReducer(state, action);
  }
};
