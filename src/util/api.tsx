import { DOMAIN, NETWORK_CONSTANTS } from '../util/constant';


/* ------------------------------------------------------------------
   TYPES
-------------------------------------------------------------------*/

export interface ApiRequestObject {
  path: string;
  body?: Record<string, any>;
  Token?: string |any;
}

export interface ApiResponse<T = any> {
  status?: boolean;
  message?: string;
  data?: T;
  token?: string;
  [key: string]: any;
}

/* ------------------------------------------------------------------
   POST API (JSON)
-------------------------------------------------------------------*/

export function javascriptPost<T = any>(
  apiRequestObject: ApiRequestObject
): Promise<ApiResponse<T>> {
  const path = `${DOMAIN.BASE}${apiRequestObject.path}`;
  console.log(path, "---------------path---------------");
  console.log(path, "---------", apiRequestObject);

  const token = apiRequestObject.Token ?? "";

  return new Promise((resolve, reject) => {
    const request: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(apiRequestObject.body || {}),
    };

    const timeoutId = setTimeout(() => {
      reject("timeout");
    }, NETWORK_CONSTANTS.connectionTimeout);

    fetch(path, request)
      .then((response) => {
        clearTimeout(timeoutId);

        response.json()
          .then((jsonResponse: ApiResponse<T>) => {
            resolve(jsonResponse);
          })
          .catch(() => {
            resolve(response as any);
          });
      })
      .catch((error) => {
        reject(error);
      });
  });
}

/* ------------------------------------------------------------------
   GET API
-------------------------------------------------------------------*/

export function javascriptGet<T = any>(
  apiRequestObject: ApiRequestObject,
  mockURL: string = ''
): Promise<ApiResponse<T>> {
  let path = `${DOMAIN.BASE}${apiRequestObject.path}`;

  if (mockURL.length > 0) {
    path = mockURL;
  }

  const token = apiRequestObject.Token ?? "";

  return new Promise((resolve, reject) => {
    const request: RequestInit = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    };

    const timeoutId = setTimeout(() => {
      reject("timeout");
    }, NETWORK_CONSTANTS.connectionTimeout);

    fetch(path, request)
      .then((response) => {
        clearTimeout(timeoutId);

        response.json()
          .then((jsonResponse: ApiResponse<T>) => {
            resolve(jsonResponse);
          })
          .catch(() => {
            resolve(response as any);
          });
      })
      .catch((error) => {
        reject(error);
      });
  });
}


// import { DOMAIN, NETWORK_CONSTANTS } from './constant';

// // import AsyncStorage from '@react-native-community/async-storage';
// const TAG_API = 'API';

// /*
//   * Normal JavaScript POST fetch function
//   * Not using SSL pinning here
//   * FORM
// */
// export function javascriptPost(apiRequestObject) {
// 	const path = `${DOMAIN.BASE}${apiRequestObject.path}`;
// 	console.log(path, "---------------path---------------");
// 	let token = `${apiRequestObject.Token}`;
// 	console.log(path,"---------",apiRequestObject)
// 	return new Promise((resolve, reject) => {
// 		const request = {
// 			method: 'post',
// 			headers: {
// 				'Content-Type': 'application/json',
// 				'Authorization': `Bearer ${apiRequestObject.Token}`
// 			},
// 			body: JSON.stringify(apiRequestObject.body)
// 		};

// 		const timeoutId = setTimeout(function () {
// 			reject(("timeout"));
// 		}, NETWORK_CONSTANTS.connectionTimeout);

// 		fetch(path, request)
// 			.then((response) => {
// 				clearTimeout(timeoutId);
// 				response.json()
// 					.then(jsonResponse => {
// 						resolve(jsonResponse);
// 					})
// 					.catch(err => {
// 						resolve(response);
// 					});
// 			})
// 			.catch((error) => {
             
// 				reject(error);
// 			});
// 	});
// }

// /*
//   * Normal JavaScript GET fetch function
//   * Not using SSL pinning here
// */
// export function javascriptGet(apiRequestObject, mockURL = '') {
// 	let path = `${DOMAIN.BASE}${apiRequestObject.path}`;
// 	let token = `${apiRequestObject.Token}`;
// 	if (mockURL.length > 0) {
// 		path = mockURL;
// 	}
// 	return new Promise((resolve, reject) => {
// 		const request = {
// 			method: 'GET',
// 			headers: {
// 				"Content-Type": 'application/json',
// 				"Authorization": `Bearer ${token}`,
// 			}
// 		};
// 		const timeoutId = setTimeout(function () {
// 			reject(("timeout"));
// 		}, NETWORK_CONSTANTS.connectionTimeout);

// 		fetch(path, request)
// 			.then((response) => {
// 				clearTimeout(timeoutId);
// 				response.json()
// 					.then(jsonResponse => {
// 						resolve(jsonResponse);
// 					})
// 					.catch(err => {
// 						resolve(response);
// 					});
// 			})
// 			.catch((error) => {
// 				reject(error);
// 			});
// 	});
// }
