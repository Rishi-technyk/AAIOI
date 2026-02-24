import { useQueries, UseQueryResult } from '@tanstack/react-query';
import { ENDPOINT } from '../util/constant';
import { javascriptGet, ApiResponse } from '../util/api';

/* ------------------------------------
   Types
------------------------------------ */

export interface DashboardRequestBody {
  [key: string]: any;
}

export type Token = string | null;

interface UseDashboardDataParams {
  token: Token;
  body: DashboardRequestBody;
}

/* ------------------------------------
   Hook
------------------------------------ */

const useDashboardData = ({ token, body }: UseDashboardDataParams) => {

  const results = useQueries({
    queries: [
      {
        queryKey: ['card_balance', body, token],
        queryFn: (): Promise<ApiResponse> =>
          javascriptGet({
            path: ENDPOINT.card_balance,
            Token: token ?? "",
            body,
          }),
        enabled: !!token, // safe guard
      },

      {
        queryKey: ['account_summary', token],
        queryFn: (): Promise<ApiResponse> =>
          javascriptGet({
            path: ENDPOINT.account_summary,
            Token: token ?? "",
            body: {}, // required by your API wrapper
          }),
        enabled: !!token,
      },
    ],
  });

  return results as UseQueryResult<ApiResponse>[];
};

export default useDashboardData;
