import { useQuery } from "@tanstack/react-query";
import { ENDPOINT } from "../../util/constant";
import { javascriptGet, javascriptGetLocal } from "../../util/api";

const fetchGroupItems = async ({ queryKey }) => {
  const [, token, data,isMember] = queryKey;
console.log( token, '---------------------- token ---------------------');
  const apiRequestObject = {
    path: `${isMember ? ENDPOINT.member_group_items : ENDPOINT.staff_group_items}?Code=${data.Code}&GroupCode=${data.GroupCode}`,
    body: data,

    Token: token,
  };

  
  const response = await javascriptGetLocal(apiRequestObject);
  console.log( response, '---------------------- response ---------------------');
  if (response.success == true) {
    return response.data;
  } else {
    return null;
  }
};
const fetchGroupItemsForMember = async ({ queryKey }) => {
  const [, token, data,isMember] = queryKey;
console.log( token, '---------------------- token ---------------------');
  const apiRequestObject = {
    path: `${isMember ? ENDPOINT.member_group_items : ENDPOINT.staff_group_items}?Code=${data.Code}&GroupCode=${data.GroupCode}`,
    body: data,

    Token: token,
  };

  
  const response = await javascriptGet(apiRequestObject);
  console.log( response, '---------------------- response ---------------------');
  if (response.success == true) {
    return response.data;
  } else {
    return null;
  }
};

export const useGroupItems = (token, data,isMember=false) => {
  console.log( "itemGroup", token, data,isMember, '---------------------- "itemGroup", token, data,isMember ---------------------');
  return useQuery({
    queryKey: ["itemGroup", token, data,isMember], // Ensure unique key
    queryFn: fetchGroupItems,
    enabled: !!token,
    staleTime: 1000 * 60 * 5, // Cache for 5 mins
    retry: 2, // Retry twice on failure
    refetchOnWindowFocus: false, // Prevent refetching on tab switch
  });
};

export const useGroupItemsForMember = (token, data,isMember=false,fetch_from='Local') => {
  console.log( "itemGroup", token, data,fetch_from, '---------------------- "itemGroup", token, data,fetch_from ---------------------');
  return useQuery({
    queryKey: ["itemGroup", token, data,isMember], // Ensure unique key
    queryFn:fetch_from=='Local'? fetchGroupItems: fetchGroupItemsForMember,
    enabled: !!token,
    staleTime: 1000 * 60 * 5, // Cache for 5 mins
    retry: 2, // Retry twice on failure
    refetchOnWindowFocus: false, // Prevent refetching on tab switch
  });
};
