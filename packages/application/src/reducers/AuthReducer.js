import {
  STORE_D_TOKEN,
  STORE_NOTIFICATION_DATA
} from '../actions/types';

const INITIAL_STATE = {
  pushToken: '',
  notificationData: []
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case STORE_D_TOKEN:
      return { ...state,
        pushToken: action.payload,
        };
    case STORE_NOTIFICATION_DATA:
      return { ...state,
        notificationData: action.payload,
        };
    default:
      return state;
  }
};
