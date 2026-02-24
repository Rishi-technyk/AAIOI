import { javascriptPost, ApiResponse } from "../util/api";
import { ENDPOINT } from "../util/constant";

/* -----------------------------------------
   Types
----------------------------------------- */

export interface SigninOTPRequest {
  member_id: string | number;
}

export interface SigninOTPResponse extends ApiResponse {
  otp?: string;
  data?: any;
}

/* -----------------------------------------
   Service
----------------------------------------- */

export async function SigninWithOTPScreenService(
  member_id: string | number
): Promise<SigninOTPResponse> {
  const body: SigninOTPRequest = { member_id };

  try {
    const apiRequestObject = {
      path: ENDPOINT.send_OTP_Signin,
      body,
    };

    const response = await javascriptPost<SigninOTPResponse>(apiRequestObject);

    return response;
  } catch (err) {
    return {
      status: false,
      message: "Error occurred while sending OTP",
    };
  }
}
