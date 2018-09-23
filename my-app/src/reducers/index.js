import { combineReducers } from "redux";
import authReducer from "./authReducer";
import errorReducers from "./errorReducers";

export default combineReducers({
  auth: authReducer,
  errors: errorReducers
});
