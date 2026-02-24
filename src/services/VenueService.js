import { useQuery } from "@tanstack/react-query";


const fetchVenuemenues = async ({ queryKey }) => {
  const [token,date,occupantType] = queryKey
  console.log( token,date,occupantType, '---------------------- token,date,occupantType ---------------------');
  const apiRequestObject = {
    Token: token,
    path: ENDPOINT.getvenue_menu,
    body: {
      funDate: date,
      occupantType: occupantType ||1
    }
  }

  try {
    console.log( apiRequestObject, '---------------------- responapiRequestObjectse ------from a[po---------------');
    const response = await javascriptPost(apiRequestObject);
    if (response.success) {
      return response
    }
  } catch (err) {
return null
  }
}
const fetchVenueSOP = async ({ queryKey }) => {
  const [token] = queryKey
  const apiRequestObject = {
    Token: token,
    path: ENDPOINT.getvenue_sop,
    body: {}
  }

  try {
    const response = await javascriptGet(apiRequestObject);
    if (response.status) {
      return response
    }else{
      return { success: false, message: "Failed to fetch SOP",data: [] }
    }
  } catch (err) {

  }
}
export const useVenues = (token,date, occupantType
) => {
  return useQuery({
    queryKey: [
      token,
      date,
      occupantType,
      "venue-menu",
    ], // Ensure unique key
    queryFn: fetchVenuemenues,
    
    enabled: !!token,
    // staleTime: 1000 * 60 * 5, // Cache for 5 mins
    retry: 2, // Retry twice on failure
    refetchOnWindowFocus: false, // Prevent refetching on tab switch
  });
};
export const useVenuesSOP = (token) => {

  return useQuery({
    queryKey: [
      token,
      "venue-sop",
    ], // Ensure unique key
    queryFn: fetchVenueSOP,

    enabled: !!token,
    cacheTime: Infinity, // Cache for 5 mins
   
    retry: 2,
    refetchOnWindowFocus: false, // Prevent refetching on tab switch
  });
};
    
import _ from "lodash";





const getBooking = async (member_id, page, search, status, type, token) => {
  try {
    const apiRequestObject = {
      path:
        `${ENDPOINT.get_booking_details}?page=${page}&type=${type}&status=${status}`,

      body: {},
      Token: token,
    };
    const response = await javascriptPost(apiRequestObject);
    return response;
  } catch (error) {
    return []
  }
};

export const useBooking = (page, search, status, type, userData) => {
  const token = userData?.data?.token;
  const member_id = userData?.data?.data?.[0]?.MemberID;
  const bookingQuery = useQuery({
    queryKey: ["booking", member_id, page, search, status, type, token],
    queryFn: () => getBooking(member_id, page, search, status, type, token),
    // enabled: false,
    retry: 2,
    refetchOnWindowFocus: true,

  });




  return { bookingQuery, };
};

import { useState, useEffect } from 'react';
import { ENDPOINT } from "../util/constant";
import { javascriptGet, javascriptPost } from "../util/api";

const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);

    return () => clearTimeout(handler); // Cleanup timeout on change
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
