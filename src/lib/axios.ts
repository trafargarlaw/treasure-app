import axios, { AxiosError, AxiosRequestConfig } from "axios";

export const AXIOS_INSTANCE = axios.create({
  baseURL: "http://localhost:8000",
});

// Add your existing interceptors to AXIOS_INSTANCE instead of api
AXIOS_INSTANCE.interceptors.request.use(async (config) => {
  const token = await window.ipcRenderer.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

AXIOS_INSTANCE.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await window.ipcRenderer.deleteToken();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Add the customInstance function required by the generator
export const api = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig
): Promise<T> => {
  const source = axios.CancelToken.source();
  const promise = AXIOS_INSTANCE({
    ...config,
    ...options,
    cancelToken: source.token,
  }).then(({ data }) => data);

  // @ts-ignore
  promise.cancel = () => {
    source.cancel("Query was cancelled");
  };

  return promise;
};

// Add these type exports
export type ErrorType<Error> = AxiosError<Error>;
export type BodyType<BodyData> = BodyData;
