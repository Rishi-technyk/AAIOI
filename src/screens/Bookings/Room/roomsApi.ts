import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import moment from 'moment';
import { DOMAIN } from '../../../util/constant';

export const roomsApi = createApi({
  reducerPath: 'roomsApi',

  baseQuery: fetchBaseQuery({
    baseUrl: DOMAIN.BASE,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth?.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),

  tagTypes: ['Rooms', 'Cart', 'SOP', 'Occupant', 'Settings'],

  endpoints: (builder) => ({

    /** -------------------
     *  Fetch Available Rooms
     *  POST /get/rooms
     *  ------------------*/
    fetchRooms: builder.mutation({
      query: ({ check_in, check_out }) => {
        const form = new FormData();
        form.append('check_in', moment(check_in).format('YYYY-MM-DD'));
        form.append('check_out', moment(check_out).format('YYYY-MM-DD'));

        return {
          url: 'member/get/avaiable/rooms',
          method: 'POST',
          body: form,
        };
      },
      invalidatesTags: ['Rooms', 'Cart'],
    }),

    /** -------------------
     *  GET SOP / RULES
     *  ------------------*/
    fetchSOP: builder.query({
      query: () => `member/get/SOP`,
      providesTags: ['SOP'],
    }),

    /** -------------------
     *  GET Occupants
     *  ------------------*/
    fetchOccupants: builder.query({
      query: () => `member/get/occupant`,
      providesTags: ['Occupant'],
    }),

    /** -------------------
     *  GET Min/Max Day Settings
     *  ------------------*/
    fetchSettings: builder.query({
      query: () => `member/get/setting`,
      providesTags: ['Settings'],
      transformResponse: (response) => ({
        min_days: Number(response?.data?.min_days || 1),
        max_days: Number(response?.data?.max_days || 30),
      }),
    }),

    /** -------------------
     *  Get Room Charge
     *  ------------------*/
    getRoomCharge: builder.mutation({
      query: ({ occupant_id, category_id, category_type_id, room_category_id }) => {
        const form = new FormData();
        form.append('occupant_id', occupant_id);
        form.append('category_id', category_id);
        form.append('category_type_id', category_type_id);
        form.append('room_category_id', room_category_id);

        return {
          url: 'member/get/room/charge',
          method: 'POST',
          body: form,
        };
      },
    }),

    /** -------------------
     *  Add to cart
     *  ------------------*/
    addToCart: builder.mutation({
      query: (payload) => {
        const form = new FormData();
        Object.keys(payload).forEach((key) => {
          form.append(key, payload[key]);
        });

        return {
          url: 'member/store/in/summary',
          method: 'POST',
          body: form,
        };
      },
      invalidatesTags: ['Cart'],
    }),

    /** -------------------
     *  Empty user cart
     *  ------------------*/
    emptyCart: builder.mutation({
      query: (card_id) => ({
        url: `member/room/card/empty/${card_id}`,
        method: 'GET',
      }),
      invalidatesTags: ['Cart'],
    }),
  }),
});

export const {
  useFetchRoomsMutation,
  useFetchSOPQuery,
  useFetchOccupantsQuery,
  useFetchSettingsQuery,
  useAddToCartMutation,
  useGetRoomChargeMutation,
  useEmptyCartMutation,
} = roomsApi;
