import {
    SET_MY_LOCATION
} from './types';

export const setMyLocation = (location) => {
    return dispatch => {
        dispatch({ type: SET_MY_LOCATION, mylocation: location });
    }
}
