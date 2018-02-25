import { combineReducers } from 'redux';
import routerReducer from './router_reducer';
import userReducer from './user_reducers';

export default combineReducers({
    router: routerReducer,
    user: userReducer
});
