import {
    SET_MY_LOCATION
} from '../actions/types';

const INITIAL_STATE = {
    myLocation: {},
};

export default function (state = INITIAL_STATE, action) {
    switch (action.type) {
        case SET_MY_LOCATION:
            return { ...state, myLocation: action.mylocation };
        default:
            return state;
    }
}