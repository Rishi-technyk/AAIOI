
export const loginRequest = (username, password,data) => {
  
    return {
      type: 'LOGIN_REQUEST',
      payload: { username, password,data }
    };
  };
  
  export const loginSuccess = (data) => ({
    type: 'USER_LOGIN_SUCCESS',
    payload: { data }
  });
  
  export const Add_Item = (data) => ({
    type: 'ADD_ITEM',
    payload:  {data} 
  });
  export const INCREMENT_ROOMCOUNT = (data) => ({
    type: 'INCREMENT_ROOMCOUNT',
    payload:  {data} 
  });
  export const DECREMENT_ROOMCOUNT = (data) => ({
    type: 'DECREMENT_ROOMCOUNT',
    payload:  {data} 
  });
  export const UPDATE_OCCUPANT = (data) => ({
    type: 'UPDATE_OCCUPANT',
    payload:  {data} 
  });
  export const UPDATE_AMOUNT = (data) => ({
    type: 'UPDATE_AMOUNT',
    payload:  {data} 
  });
  export const UPDATE_ADULT = (data) => ({
    type: 'UPDATE_ADULT',
    payload:  {data} 
  });
  export const UPDATE_CHILD = (data) => ({
    type: 'UPDATE_CHILD',
    payload:  {data} 
  });
  export const UPDATE_BOOK_ID = (data) => ({
    type: 'UPDATE_BOOK_ID',
    payload:  {data} 
  });
  export const UPDATE_GUEST_NAME = (data) => ({
    type: 'UPDATE_GUEST_NAME',
    payload:  {data} 
  });
  export const UPDATE_GUEST_EMAIL = (data) => ({
    type: 'UPDATE_GUEST_EMAIL',
    payload:  {data} 
  });
  export const UPDATE_GUEST_MOBLIE = (data) => ({
    type: 'UPDATE_GUEST_MOBLIE',
    payload:  {data} 
  });
  export const REMOVEALL_FROM_CART = (data) => ({
    type: 'REMOVEALL_FROM_CART',
    payload:  {data} 
  });
  export const loginFailure = (error) => ({
    type: 'LOGIN_FAILURE',
    payload: { error }
  });
  
  export const signupRequest = (username, password, email) => ({
    type: 'SIGNUP_REQUEST',
    payload: { username, password, email }
  });
  
  export const signupSuccess = (user) => ({
    type: 'SIGNUP_SUCCESS',
    payload: { user }
  });
  
  export const signupFailure = (error) => ({
    type: 'SIGNUP_FAILURE',
    payload: { error }
  });
  
  export const logoutSuccess = (data) => ({
    type: 'LOGOUT_SUCCESS',
    payload: { data }
  });
  
  export const loginUserFailure = (error) =>  {
    return {
      type: 'USER_LOGIN_FAILURE',
      payload: error
    }
  }
  
  
  export const changeInternetState = (internetState) => {
    return {
      type: 'INTERNET_CHANGED',
      payload: internetState
    }
  }
  
  