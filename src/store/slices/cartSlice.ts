
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],   // Each entry = one room category
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,

  reducers: {

    /** ----------------------------------------
     *  Add new room category to cart
     *  ----------------------------------------*/
    Add_Item: (state, action) => {
      // const { room_id } = action.payload;
      const room_id = Number(action.payload.room_id);

      const exists = state.items.find((r) => r.room_id === room_id);
      if (!exists) {
        state.items.push({
          room_id,
          roomcount: 1,
          adult: '',
          child_cate: '',
          selectoccupant: '',
          occupant_id: '',
          additional_info: '',
          amount: 0,
          book_id: '',
          guest_name: '',
          guest_email: '',
          guest_mobile: '',
        });
      }
    },

    /** ----------------------------------------
     *  Increase room count
     *  ----------------------------------------*/
    INCREMENT_ROOMCOUNT: (state, action) => {
      const item = state.items.find((r) => r.room_id === action.payload.room_id);
      if (item) {
        item.roomcount += 1;
      }
    },

    /** ----------------------------------------
     *  Decrease room count
     *  ----------------------------------------*/
    DECREMENT_ROOMCOUNT: (state, action) => {
      const item = state.items.find((r) => r.room_id === action.payload.room_id);
      if (item && item.roomcount > 1) {
        item.roomcount -= 1;
      }
    },

    /** ----------------------------------------
     *  Update Occupant
     *  ----------------------------------------*/
    UPDATE_OCCUPANT: (state, action) => {
      console.log(action)
      const { room_id, selectoccupant, occupant_id, additional_info } = action.payload;
      const item = state.items.find((r) => r.room_id === Number(room_id));

      if (item) {

        item.selectoccupant = selectoccupant;
        item.occupant_id = occupant_id;
        item.additional_info = additional_info;
      }
    },

    /** ----------------------------------------
     *  Update Adult count
     *  ----------------------------------------*/
    UPDATE_ADULT: (state, action) => {
      
      const { room_id, adult } = action.payload;
      console.log('Updating adult count for room:', room_id, 'to', adult);
      const item = state.items.find((r) => r.room_id === room_id);
console.log('Found item:', item);
      if (item) item.adult = adult;
    },

    /** ----------------------------------------
     *  Update Child count
     *  ----------------------------------------*/
    UPDATE_CHILD: (state, action) => {
      const { room_id, child_cate } = action.payload;
      const item = state.items.find((r) => r.room_id === room_id);
      if (item) item.child_cate = child_cate;
    },

    /** ----------------------------------------
     *  Update Amount (Room Charges)
     *  ----------------------------------------*/
    UPDATE_AMOUNT: (state, action) => {
      const { room_id, amount } = action.payload;
      const item = state.items.find((r) => r.room_id === room_id);
     
      if (item) item.amount = amount;
    },

    /** ----------------------------------------
     *  Update Book ID (cart lock)
     *  ----------------------------------------*/
    UPDATE_BOOK_ID: (state, action) => {
      const { room_id, book_id } = action.payload;
      const item = state.items.find((r) => r.room_id === room_id);
      if (item) item.book_id = book_id;
    },

    /** ----------------------------------------
     *  Update Guest Name
     *  ----------------------------------------*/
    UPDATE_GUEST_NAME: (state, action) => {
      const { room_id, guest_name } = action.payload;
      const item = state.items.find((r) => r.room_id === room_id);
      if (item) item.guest_name = guest_name;
    },

    /** ----------------------------------------
     *  Update Guest Email
     *  ----------------------------------------*/
    UPDATE_GUEST_EMAIL: (state, action) => {
      const { room_id, guest_email } = action.payload;
      const item = state.items.find((r) => r.room_id === room_id);
      if (item) item.guest_email = guest_email;
    },

    /** ----------------------------------------
     *  Update Guest Mobile
     *  ----------------------------------------*/
    UPDATE_GUEST_MOBLIE: (state, action) => {
      const { room_id, guest_mobile } = action.payload;
      const item = state.items.find((r) => r.room_id === room_id);
      if (item) item.guest_mobile = guest_mobile;
    },

    /** ----------------------------------------
     *  Clear cart
     *  ----------------------------------------*/
    REMOVEALL_FROM_CART: (state) => {
      state.items = [];
    },
  },
});

export const {
  Add_Item,
  INCREMENT_ROOMCOUNT,
  DECREMENT_ROOMCOUNT,
  UPDATE_OCCUPANT,
  UPDATE_ADULT,
  UPDATE_CHILD,
  UPDATE_AMOUNT,
  UPDATE_BOOK_ID,
  UPDATE_GUEST_EMAIL,
  UPDATE_GUEST_NAME,
  UPDATE_GUEST_MOBLIE,
  REMOVEALL_FROM_CART,
} = cartSlice.actions;

export default cartSlice.reducer;

// import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// interface CartItem {
//   room_id: number;
//   roomcount: number;
//   adult?: number;
//   child_cate?: number;
//   selectoccupant?: string;
//   occupant_id?: number;
//   additional_info?: string;
//   amount?: number;
//   book_id?: string;
//   guest_name?: string;
//   guest_email?: string;
//   guest_mobile?: string;
// }

// interface CartState {
//   items: CartItem[];
// }

// const initialState: CartState = {
//   items: [],
// };

// const cartSlice = createSlice({
//   name: "cart",
//   initialState,
//   reducers: {

//     /* -------------------- Add Item -------------------- */
//     Add_Item: (state, action: PayloadAction<CartItem>) => {

//       const exists = state.items.some(i => i.room_id === action.payload.room_id);
//       if (!exists) {
//         state.items.push({
//           room_id: action.payload.room_id,
//           roomcount: 1,
//           adult: undefined,
//           child_cate: undefined,
//           selectoccupant: "",
//           occupant_id: undefined,
//           additional_info: "",
//           amount: undefined,
//           book_id: "",
//           guest_name: "",
//           guest_email: "",
//           guest_mobile: "",
//         });
//       }
//     },

//     /* -------------------- Room Quantity -------------------- */
//     INCREMENT_ROOMCOUNT: (state, action: PayloadAction<{ room_id: number }>) => {
//       const item = state.items.find(i => i.room_id === action.payload.room_id);
//       if (item) item.roomcount++;
//     },

//     DECREMENT_ROOMCOUNT: (state, action: PayloadAction<{ room_id: number }>) => {
//       const item = state.items.find(i => i.room_id === action.payload.room_id);
//       if (item && item.roomcount > 1) item.roomcount--;
//     },

//     /* -------------------- Occupant -------------------- */
//     UPDATE_OCCUPANT: (
//       state,
//       action: PayloadAction<{
//         room_id: number;
//         selectoccupant: string;
//         occupant_id: number;
//         additional_info: string;
//       }>
//     ) => {
//       const item = state.items.find(i => i.room_id === action.payload.room_id);
//       if (item) {
//         item.selectoccupant = action.payload.selectoccupant;
//         item.occupant_id = action.payload.occupant_id;
//         item.additional_info = action.payload.additional_info;
//       }
//     },

//     /* -------------------- Adult / Child -------------------- */
//     UPDATE_ADULT: (state, action: PayloadAction<{ room_id: number; adult: number }>) => {
//       const item = state.items.find(i => i.room_id === action.payload.room_id);
//       if (item) item.adult = action.payload.adult;
//     },

//     UPDATE_CHILD: (state, action: PayloadAction<{ room_id: number; child_cate: number }>) => {
//       const item = state.items.find(i => i.room_id === action.payload.room_id);
//       if (item) item.child_cate = action.payload.child_cate;
//     },

//     /* -------------------- Amount -------------------- */
//     UPDATE_AMOUNT: (state, action: PayloadAction<{ room_id: number; amount: number }>) => {
//       const item = state.items.find(i => i.room_id === action.payload.room_id);
//       if (item) item.amount = action.payload.amount;
//     },

//     /* -------------------- Book ID -------------------- */
//     UPDATE_BOOK_ID: (
//       state,
//       action: PayloadAction<{ room_id: number; book_id: string }>
//     ) => {
//       const item = state.items.find(i => i.room_id === action.payload.room_id);
//       if (item) item.book_id = action.payload.book_id;
//     },

//     /* -------------------- Guest Details -------------------- */
//     UPDATE_GUEST_NAME: (state, action) => {
//       const item = state.items.find(i => i.room_id === action.payload.room_id);
//       if (item) item.guest_name = action.payload.guest_name;
//     },

//     UPDATE_GUEST_EMAIL: (state, action) => {
//       const item = state.items.find(i => i.room_id === action.payload.room_id);
//       if (item) item.guest_email = action.payload.guest_email;
//     },

//     UPDATE_GUEST_MOBLIE: (state, action) => {
//       const item = state.items.find(i => i.room_id === action.payload.room_id);
//       if (item) item.guest_mobile = action.payload.guest_mobile;
//     },

//     /* -------------------- Clear Cart -------------------- */
//     REMOVEALL_FROM_CART: (state) => {
//       state.items = [];
//     },
//   },
// });

// export const {
//   Add_Item,
//   UPDATE_ADULT,
//   UPDATE_CHILD,
//   INCREMENT_ROOMCOUNT,
//   DECREMENT_ROOMCOUNT,
//   UPDATE_BOOK_ID,
//   UPDATE_GUEST_MOBLIE,
//   UPDATE_GUEST_EMAIL,
//   UPDATE_GUEST_NAME,
//   UPDATE_OCCUPANT,
//   UPDATE_AMOUNT,
//   REMOVEALL_FROM_CART,
// } = cartSlice.actions;

// export default cartSlice.reducer;
// import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// interface CartItem {
//   room_id: number;
//   roomcount?: number;
//   adult?: number;
//   child_cate?: number;
//   selectoccupant?: string;
//   occupant_id?: number;
//   additional_info?: string;
//   amount?: number;
//   book_id?: string;
//   guest_name?: string;
//   guest_email?: string;
//   guest_mobile?: string;
// }

// interface CartState {
//   items: CartItem[];
// }

// const initialState: CartState = {
//   items: [],
// };

// const cartSlice = createSlice({
//   name: "cart",
//   initialState,
//   reducers: {
//     /* -------------------- Add Item -------------------- */
//     Add_Item: (state, action: PayloadAction<CartItem>) => {
//       const exists = state.items.some(i => i.room_id === action.payload.room_id);

//       if (!exists) {
//         state.items.push({
//           roomcount: 1,
//           adult: undefined,
//           child_cate: undefined,
//           selectoccupant: "",
//           occupant_id: undefined,
//           additional_info: "",
//           amount: undefined,
//           book_id: "",
//           guest_name: "",
//           guest_email: "",
//           guest_mobile: "",
//           ...action.payload,
//         });
//       }
//     },

//     /* -------------------- Increment Count -------------------- */
//     INCREMENT_ROOMCOUNT: (state, action: PayloadAction<{ room_id: number }>) => {
//       const item = state.items.find(i => i.room_id === action.payload.room_id);
//       if (item) item.roomcount = (item.roomcount || 0) + 1;
//     },

//     /* -------------------- Decrement Count -------------------- */
//     DECREMENT_ROOMCOUNT: (state, action: PayloadAction<{ room_id: number }>) => {
//       const item = state.items.find(i => i.room_id === action.payload.room_id);
//       if (item && (item.roomcount || 0) > 1) {
//         item.roomcount = (item.roomcount || 0) - 1;
//       }
//     },

//     /* -------------------- Update Occupant -------------------- */
//     UPDATE_OCCUPANT: (
//       state,
//       action: PayloadAction<{
//         room_id: number;
//         selectoccupant: string;
//         occupant_id: number;
//         additional_info: string;
//       }>
//     ) => {
//       const item = state.items.find(i => i.room_id === action.payload.room_id);
//       if (item) {
//         item.selectoccupant = action.payload.selectoccupant;
//         item.occupant_id = action.payload.occupant_id;
//         item.additional_info = action.payload.additional_info;
//       }
//     },

//     /* -------------------- Update Adult -------------------- */
//     UPDATE_ADULT: (
//       state,
//       action: PayloadAction<{ room_id: number; adult: number }>
//     ) => {
//       const item = state.items.find(i => i.room_id === action.payload.room_id);
//       if (item) item.adult = action.payload.adult;
//     },

//     /* -------------------- Update Child -------------------- */
//     UPDATE_CHILD: (
//       state,
//       action: PayloadAction<{ room_id: number; child_cate: number }>
//     ) => {
//       const item = state.items.find(i => i.room_id === action.payload.room_id);
//       if (item) item.child_cate = action.payload.child_cate;
//     },

//     /* -------------------- Update Amount -------------------- */
//     UPDATE_AMOUNT: (
//       state,
//       action: PayloadAction<{ room_id: number; amount: number }>
//     ) => {
//       const item = state.items.find(i => i.room_id === action.payload.room_id);
//       if (item) item.amount = action.payload.amount;
//     },

//     /* -------------------- Update Book ID -------------------- */
//     UPDATE_BOOK_ID: (
//       state,
//       action: PayloadAction<{ room_id: number; book_id: string }>
//     ) => {
//       const item = state.items.find(i => i.room_id === action.payload.room_id);
//       if (item) item.book_id = action.payload.book_id;
//     },

//     /* -------------------- Update Guest Name -------------------- */
//     UPDATE_GUEST_NAME: (
//       state,
//       action: PayloadAction<{ room_id: number; guest_name: string }>
//     ) => {
//       const item = state.items.find(i => i.room_id === action.payload.room_id);
//       if (item) item.guest_name = action.payload.guest_name;
//     },

//     /* -------------------- Update Guest Email -------------------- */
//     UPDATE_GUEST_EMAIL: (
//       state,
//       action: PayloadAction<{ room_id: number; guest_email: string }>
//     ) => {
//       const item = state.items.find(i => i.room_id === action.payload.room_id);
//       if (item) item.guest_email = action.payload.guest_email;
//     },

//     /* -------------------- Update Guest Mobile -------------------- */
//     UPDATE_GUEST_MOBLIE: (
//       state,
//       action: PayloadAction<{ room_id: number; guest_mobile: string }>
//     ) => {
//       const item = state.items.find(i => i.room_id === action.payload.room_id);
//       if (item) item.guest_mobile = action.payload.guest_mobile;
//     },

//     /* -------------------- Remove All -------------------- */
//     REMOVEALL_FROM_CART: (state) => {
//       state.items = [];
//     },
//   },
// });

// /* EXPORT REDUX ACTIONS */
// export const {
//   Add_Item,
//   UPDATE_ADULT,
//   UPDATE_CHILD,
//   INCREMENT_ROOMCOUNT,
//   DECREMENT_ROOMCOUNT,
//   UPDATE_BOOK_ID,
//   UPDATE_GUEST_MOBLIE,
//   UPDATE_GUEST_EMAIL,
//   UPDATE_GUEST_NAME,
//   UPDATE_OCCUPANT,
//   UPDATE_AMOUNT,
//   REMOVEALL_FROM_CART,
// } = cartSlice.actions;

// export default cartSlice.reducer;
