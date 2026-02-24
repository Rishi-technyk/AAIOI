
export const ADD_TO_CART = 'ADD_TO_CART'
export const ADD_TO_HOURS = 'ADD_TO_HOURS'
export const REMOVE_FROM_CART = 'REMOVE_FROM_CART'
export const REMOVEALL_FROM_CART = 'REMOVEALL_FROM_CART'
export const ADD_QUANTITY = 'ADD_QUANTITY'
export const SUB_QUANTITY = 'SUB_QUANTITY'
export const ADD_ONS = 'ADD_ONS'
export const DELETE_ADD_ONS = 'DELETE_ADD_ONS'
const initialState = []

const cartItemsReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_TO_CART:
      let addedItem = state.find(item=> item.room_id == action.payload.room_id)
      console.log("[[[[[[[[[]]]]]]]]]]]]]]][[]]]]]]]]]",action.payload.room_id,state,addedItem)
      //check if the action id exists in the addedItems
    // let existed_item= addedItems.find(item=> action.id === item.id)
      console.log("';;;;';';'';';'",action.payload)
      if(state.length == 0){
        return [...state, action.payload]
      }else if(addedItem != undefined){
        
        if(addedItem.room_id == action.payload.room_id){
          return [...state]
        }else{
          return [...state,action.payload]
        }
      }else{
        return [...state, action.payload]
      }
     
    case REMOVE_FROM_CART:
      return state.filter(cartItem => cartItem.ser_attr_val_item_id !== action.payload)
      case REMOVEALL_FROM_CART:
        return initialState
        case ADD_QUANTITY:
          let k 
          var l = state.findIndex((Item) => Item.ser_attr_val_item_id == action.payload)
          state.map(product =>
            product.ser_attr_val_item_id == action.payload
              ? k={...product, attribute_qty: Number(product.attribute_qty) + 1}
              : product
          )
          state.push(k)
          console.log("mhdfdfdfdfdfdf",state.splice(l,1) )
      return [...state];
    case SUB_QUANTITY:
      let M
      var l = state.findIndex((Item) => Item.ser_attr_val_item_id == action.payload)
      state.map(product =>
        product.ser_attr_val_item_id == action.payload
          ? M={...product, attribute_qty: Number(product.attribute_qty) - 1}
          : product
      )
      state.push(M)
      console.log("mhdfdfdfdfdfdf",state.splice(l,1) )
  return [...state
     ];
     case ADD_TO_HOURS:
      let H
      var l = state.findIndex((Item) => Item.service_type == action.payload.service_type)
      state.map(product =>
        product.service_type == action.payload.service_type
          ? H={...product, attribute_qty:action.payload.attribute_qty,attribute_item_id:action.payload.attribute_item_id,
            attribute_item:action.payload.attribute_item}
          : product
      )
      state.push(H)
      console.log("mhdfdfdfdfdfdf",state.splice(l,1) )
  return [...state
     ];
     case ADD_ONS:
  //     
  const updatedCart = state.map(item => {
    if (item.attribute_item_id === action.payload.attribute_item_id) {
      const updatedItem = { ...item };
      if (typeof updatedItem.add_on === 'object' && !Array.isArray(updatedItem.add_on)) {
        updatedItem.add_on = Object.entries(updatedItem.add_on).map(([key, value]) => ({ add_on_id: key, ...value }));
      }
      updatedItem.add_on = [action.payload.add];
      return updatedItem;
    }
    return item;
  });
  return updatedCart;
  // ...
  case 'DELETE_ADD_ONS':
    const { attributeItemId, addOnId } = action.payload;
    const updatedArray = state.map(item => {
      if (item.attribute_item_id === action.payload.attribute_item_id) {
        const updatedItem = { ...item };
        updatedItem.add_on = updatedItem.add_on.filter(addon => addon.add_on_id !== action.payload.add_on_id);
        return updatedItem;
      }
      return item;
    });
    return updatedArray;

  }
  return state
}

export default cartItemsReducer