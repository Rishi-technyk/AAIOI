import { useQuery } from "@tanstack/react-query";
import { ENDPOINT } from "../util/constant";
import { javascriptGet, javascriptPost } from "../util/api";



const fetchTeeData=async({queryKey}:{queryKey:any[]})=>{
const [,token,tempStartDate,session]=queryKey

    const apiObj={
        path:ENDPOINT.tee_settings,
        Token:token,
        body:{
         'date': tempStartDate,
         'session_name':session.id ? session.id:"All Day"
        }
    }
    try {
     const response= await javascriptPost(apiObj);
      if(response.status){

         return response
       }else{
        return null
      }
    } catch (error) {
        console.log(error)
    }
}
const searchBuddies=async({queryKey}:{queryKey:any[]})=> {
const [,token,session_id,search]=queryKey
    const apiObj={
        path:`${ENDPOINT.tee_srarch_buddies+session_id}?search=${search}`,
        Token:token,
        body:{
        }
    }
    try {
     const response= await javascriptGet(apiObj);
     if(response.status){

         return response.data
       }else{
        return null
      }
    } catch (error) {
        console.log(error)
    }
}
const fetchSessions=async({queryKey}:{queryKey:any[]})=>{
const [,token,]=queryKey
    const apiObj={
        path:ENDPOINT.tee_sessions,
        Token:token,
        body:{
        }
    }
    try {
     const response= await javascriptGet(apiObj);
     console.log('\x1b[36m%s\x1b[0m', response, '---------------------- response ---------------------');
      if(response.status){

         return response
       }else{
        return null
      }
    } catch (error) {
        console.log(error)
    }
}
export const useTee = (userData,tempStartDate,session) => {

  const token = userData?.token;
  const bookingQuery = useQuery({
    queryKey: ["booking", token,tempStartDate,session],
    queryFn:  fetchTeeData,
    refetchOnWindowFocus:'always',
    refetchInterval:120000,
    enabled: !!token,
    // retry: 2,

    // refetchOnWindowFocus: false,
    
  });

//   const facilityQuery = useQuery({
//     queryKey: ["Facilities",],
//     queryFn: () => fetchTeeData(),
//     enabled: true,
//     retry: 2,
//     refetchOnWindowFocus: false,
//     staleTime: Infinity,
//     cacheTime: Infinity,
//   });



  return  bookingQuery;
};
export const useSession = (userData,tempStartDate) => {

  const token = userData?.token||userData;
  const sessionsQuery = useQuery({
    queryKey: ["sessions", token],
    queryFn:  fetchSessions,
    enabled: !!token,
    retry: 2,
    staleTime:Infinity
  });
  return  sessionsQuery;
}
export const useBuddies = (userData,session_id,search) => {
 const token = userData?.token;
  const sessionsQuery = useQuery({
    queryKey: ["buddies", token,session_id,search],
    queryFn:  searchBuddies,
    enabled: !!token,
    retry: 2,
    staleTime:Infinity
  });

  return  sessionsQuery;
}
export const userGroups = (token: string) => {
  console.log(token, 'from userGroups');
  return useQuery({
    queryKey: ["userGroups", token],
    enabled: !!token,
    retry: 2,
    staleTime: Infinity,

    queryFn: async () => {
      try {
        const response = await javascriptGet({
          path: ENDPOINT.tee_group,
          Token: token.toString(),
        });
console.log(response)
        if (response?.status) {
          return response.data;
        }

        return null;
      } catch (error) {
        console.log("userGroups error:", error);
        return null;
      }
    },
  });
};

export const userFavoriteGroups = (token,session_id,search) => {

  console.log('\x1b[36m%s\x1b[0m', '--------------------- ---------------------');
  const sessionsQuery = useQuery({
    queryKey: ["userFavoriteGroups", token],
    queryFn:  async({queryKey})=>{
      const [,token]=queryKey
          const apiObj={
              path:ENDPOINT.tee_favorite_group+session_id,
              Token:token,
              body:{
                
              }
          }
          try {
           const response= await javascriptGet(apiObj);
           if(response.status){

               return response.data
             }else{
              return null
            }
          } catch (error) {
              console.log(error)
          }
    },
    enabled: !!token,
    retry: 2,
    staleTime:Infinity
  });
  return  sessionsQuery;
}


export const userMyBookings = (token,) => {

  
  const bookingQuery = useQuery({
    queryKey: ["useMyBookings", token, ],
    queryFn:  async({queryKey})=>{
      const [,token]=queryKey
          const apiObj={
              path:ENDPOINT.get_tee_bookings,
              Token:token,
              body:{
               
              }
          }
          try {
           const response= await javascriptGet(apiObj);
           if(response.status){

               return response.data
             }else{
              return null
            }
          } catch (error) {
              console.log(error)
          }
    },
    enabled: !!token,
    retry: 2,
    staleTime:Infinity
  });
  return  bookingQuery;
}