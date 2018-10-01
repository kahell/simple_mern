import { combineReducers } from "redux";
import authReducer from "./authReducer";
import errorReducers from "./errorReducers";
import profileReducer from "./profileReducer";
import postReducer from "./postReducer";

export default combineReducers({
  auth: authReducer,
  errors: errorReducers,
  profile: profileReducer,
  post: postReducer
});
