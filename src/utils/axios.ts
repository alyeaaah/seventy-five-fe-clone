import axios, { InternalAxiosRequestConfig } from "axios";
import { paths } from "@/router/paths";

import { clientEnv } from "../env";
import { accessTokenAtom, store, unauthorizedErrorMessageAtom } from "./store";

export const createAxiosInstance = () => { 
  
  const axiosInstance = axios.create();
  
  axiosInstance.interceptors.request.use((config => {
    const isRequestingOurApi =
    config.baseURL?.includes(`${clientEnv.API_BASE_URL}`) || 
    config.baseURL?.includes(`${clientEnv.API_BASE_URL}/admin`) || 
    config.baseURL?.includes(`${clientEnv.API_BASE_URL}/member`) ;
    
    if (isRequestingOurApi) {
      config.headers.Authorization = store.get(accessTokenAtom);; 
    }
    return config;
  }));
 
  axiosInstance.interceptors.request.use((config => {
   if (!config.paramsSerializer) {
      config.paramsSerializer = {
        //  remove params that are null, undefined, or empty string
        serialize: (params) => {
          const result = new URLSearchParams();
          Object.entries(params).forEach(([key, value]) => {
            if (["", null, undefined].includes(value as any)) {
              return;
            }

            if (Array.isArray(value)) {
              value.forEach((v) => {
                if (!["", null, undefined].includes(v as any)) {
                  result.append(key, String(v));
                }
              });
              return;
            }

            result.append(key, String(value));
          });
          return result.toString();
        },
      };
    }

    return config;
  }));

  axiosInstance.interceptors.response.use(
    null,
    (error) => { 
      if (error?.status === 400) {
        throw error?.response?.data || error;
      } else if (error?.status === 401) {

      if (
        error.response?.status === 401 &&
        window.location.pathname !== paths.login({}).$
      ) {
        if (!store.get(unauthorizedErrorMessageAtom)) {
          store.set(unauthorizedErrorMessageAtom, error.response.data.message);
          store.set(accessTokenAtom, null);
        }
      }
        throw error?.response?.data || error
      }
      else {
        // toast.error(error, { duration: 2000 });
      }
      throw error?.response?.data || error;

    },
  );

  axiosInstance.interceptors.response.use(
    null,
    responseUnauthorizedErrorInterceptor,
  );
  return axiosInstance;
};


export function requestAccessTokenInterceptor(
  config: InternalAxiosRequestConfig<unknown>,
) {
  const isRequestingOurApi =
    config.baseURL?.startsWith(clientEnv.API_BASE_URL) ||
    config.url?.startsWith(clientEnv.API_BASE_URL);

  const accessToken = store.get(accessTokenAtom);

  if (isRequestingOurApi && accessToken) {
    config.headers.Authorization = accessToken;
  }

  return config;
}

export function requestParamsSerializerInterceptor(
  config: InternalAxiosRequestConfig<unknown>,
) {
  if (!config.paramsSerializer) {
    config.paramsSerializer = {
      //  remove params that are null, undefined, or empty string
      serialize: (params) => {
        const result = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (["", null, undefined].includes(value as any)) {
            return;
          }

          if (Array.isArray(value)) {
            value.forEach((v) => {
              if (!["", null, undefined].includes(v as any)) {
                result.append(key, String(v));
              }
            });
            return;
          }

          result.append(key, String(value));
        });
        return result.toString();
      },
    };
  }

  return config;
}

export function responseUnauthorizedErrorInterceptor(error: any) {
  
  if (
    error.response?.status === 401 &&
    window.location.pathname !== paths.login({}).$
  ) {

    if (!store.get(unauthorizedErrorMessageAtom)) {
      store.set(unauthorizedErrorMessageAtom, error.response.data.message);
    }
  }

  return Promise.reject(error);
}
