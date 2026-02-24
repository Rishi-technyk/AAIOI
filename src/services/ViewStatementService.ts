// // ViewStatementService.ts
// import { useQuery } from "@tanstack/react-query";
// import { javascriptPost, javascriptGet } from "../util/api";
// import { ENDPOINT } from "../util/constant";

// export interface TransactionFilters {
//   startDate?: string | null;
//   endDate?: string | null;
//   locations?: string | null;
//   paymode?: string | null;
//   transactionType?: "credit" | "debit" | null;
//   minAmount?: number | null;
//   maxAmount?: number | null;
//   textSearch?: string | null;
//   voucherNo?: string | null;
//   category?: string | null;
//   sortBy?: { key: string; dir: "asc" | "desc" } | null;
// }

// /**
//  * useTransactions
//  * Posts the full filter object to member/transaction/filter
//  * Expects the backend to return:
//  * { opening_balance, closing_balance, total_credit, total_debit, data: [...] }
//  */
// export const useTransactions = (filters: TransactionFilters, userData: any) => {
//   return useQuery({
//     queryKey: ["transactions", filters, userData?.token],
//     queryFn: async () => {
//       const body: any = {
//         start_date: filters.startDate || null,
//         end_date: filters.endDate || null,
//         locations: filters.locations || null,
//         pay_mode: filters.paymode || null,
//         txn_type: filters.transactionType || null,
//         min_amount: filters.minAmount ?? null,
//         max_amount: filters.maxAmount ?? null,
//         search: filters.textSearch || null,
//         voucher_no: filters.voucherNo || null,
//         category: filters.category || null,
//         sort_key: filters.sortBy?.key || "BillDate",
//         sort_dir: filters.sortBy?.dir || "desc",
//       };

//       // Use full URL or relative path depending on your javascriptPost implementation
//       return await javascriptPost({
//         path: "member/transaction/filter",
//         body,
//         Token: userData?.token,
//       });
//     },
//     enabled: !!userData?.token,
//     retry: 1,
//     refetchOnWindowFocus: false,
//   });
// };

// /**
//  * useStatements (PDF/summary) - kept as a helper for "View Bill"
//  * Update ENDPOINT.statement in your constants if needed.
//  */
// export const useStatments = (userData: any) => {
//   return useQuery({
//     queryKey: ["statements", userData?.token],
//     queryFn: async () => {
//       return await javascriptGet({
//         path: ENDPOINT.statement,
//         body: {},
//         Token: userData?.token,
//       });
//     },
//     enabled: !!userData?.token,
//     retry: 1,
//     refetchOnWindowFocus: false,
//   });
// };


import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { ENDPOINT } from "../util/constant";
import {
  javascriptGet,
  javascriptPost,
  ApiResponse,
  ApiRequestObject,
} from "../util/api";

/* ---------------------------------------------------------
   TYPES
--------------------------------------------------------- */

export interface UserDataType {
  user?: { MemberID?: string | number };
  token?: string;
}

export interface TransactionFilterBody {
  ws_type?: string;
  start_date?: string;
  end_date?: string;
  member_id?: string | number;
  pay_mode?: string;
  locations?: string;
}

/* ---------------------------------------------------------
   FETCH TRANSACTIONS (POST + CONDITIONAL)
--------------------------------------------------------- */

const fetchTransactions = async ({
  queryKey,
}: {
  queryKey: [
    string,
    string,
    string,
    string | number | undefined,
    string | undefined,
    string | undefined,
    string | undefined
  ];
}): Promise<ApiResponse> => {
  const [, startDate, endDate, memberId, token, paymode, location] = queryKey;

  const body: TransactionFilterBody =
    startDate && endDate
      ? {
          ws_type: ENDPOINT.invoice_transaction_filter,
          start_date: startDate,
          end_date: endDate,
          member_id: memberId,
        }
      : {
          ws_type: ENDPOINT.invoice,
          pay_mode: paymode,
          locations: location,
          member_id: memberId,
        };

  const apiRequestObject: ApiRequestObject =
    startDate && endDate
      ? { path: ENDPOINT.invoice_transaction_filter, body, Token: token }
      : { path: ENDPOINT.invoice, body, Token: token };

  const response = await javascriptPost(apiRequestObject);

  // If NOT filtered by date → fetch account summary too
  if (!startDate && !endDate) {
    const summaryResp = await javascriptGet({
      path: ENDPOINT.account_summary,
      body: {},
      Token: token,
    });

    return {
      ...response,
      closing_balance: summaryResp?.data?.outstanding_amt,
      opening_balance: summaryResp?.data?.bill_amt,
      credit_amt: summaryResp?.data?.total_credit,
      debit_amt: summaryResp?.data?.total_debit,
    };
  }

  return response;
};

/* ---------------------------------------------------------
   FETCH STATEMENT
--------------------------------------------------------- */

export async function getStatement({
  queryKey,
}: {
  queryKey: [string, string | number | undefined, string | undefined];
}): Promise<any> {
  const [, , token] = queryKey;

  try {
    const apiRequestObject: ApiRequestObject = {
      path: ENDPOINT.statement,
      body: {},
      Token: token,
    };
    
    const response = await javascriptGet(apiRequestObject);
    return response?.data;
  } catch (err) {
    console.error(err);
    return { result: "FAILURE" };
  }
}

/* ---------------------------------------------------------
   HOOK: STATEMENTS
--------------------------------------------------------- */

export const useStatments = (
  userData: UserDataType
): UseQueryResult<any, unknown> => {
  const memberId = userData?.user?.MemberID;

  return useQuery({
    queryKey: ["statements", memberId, userData?.token],
    queryFn: getStatement,
    enabled: !!userData?.token,
    staleTime: 1000 * 60 * 5,
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

/* ---------------------------------------------------------
   HOOK: TRANSACTIONS
--------------------------------------------------------- */

export const useTransactions = (
  startDate: string | null,
  endDate: string | null,
  userData: UserDataType,
  paymode?: string,
  location?: string
): UseQueryResult<ApiResponse, unknown> => {
  const memberId = userData?.user?.MemberID;

  return useQuery({
    queryKey: [
      "transactions",
      startDate || "",
      endDate || "",
      memberId,
      userData?.token,
      paymode,
      location,
    ],
    queryFn: fetchTransactions,
    enabled: !!memberId,
    staleTime: 1000 * 60 * 5,
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

/* ---------------------------------------------------------
   FETCH RECHARGES
--------------------------------------------------------- */

const fetchRecharges = async ({
  queryKey,
}: {
  queryKey: [
    string,
    string,
    string,
    string,
    string | number | undefined,
    string | undefined,
    string | undefined
  ];
}): Promise<ApiResponse> => {
  const [, startDate, endDate, location, memberId, token, paymode] = queryKey;

  const body: TransactionFilterBody =
    (startDate && endDate) || location
      ? {
          start_date: startDate,
          end_date: endDate,
          locations: location,
          pay_mode: paymode,
          member_id: memberId,
        }
      : {
          pay_mode: paymode,
          member_id: memberId,
        };

  const apiRequestObject: ApiRequestObject =
    (startDate && endDate) || location
      ? {
          path: ENDPOINT.transaction_filter,
          body,
          Token: token,
        }
      : {
          path: ENDPOINT.transaction,
          body,
          Token: token,
        };

  return await javascriptPost(apiRequestObject);
};

/* ---------------------------------------------------------
   HOOK: RECHARGES
--------------------------------------------------------- */

export const useRecharges = (
  startDate: string,
  endDate: string,
  location: string,
  userData: UserDataType,
  paymode?: string
): UseQueryResult<ApiResponse, unknown> => {
  return useQuery({
    queryKey: [
      "transactions",
      startDate || "",
      endDate || "",
      location,
      userData?.user?.MemberID,
      userData?.token,
      paymode,
    ],
    queryFn: fetchRecharges,
    enabled: !!userData?.user?.MemberID,
    retry: 2,
    refetchOnWindowFocus: false,
  });
};
