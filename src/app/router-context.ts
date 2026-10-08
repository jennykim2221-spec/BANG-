import { createContext, useContext } from "react";
export type Router = { url: string; go: (url: string) => void; backFromSearch: () => void };
export const RouterContext = createContext<Router>({ url: "/", go: () => {}, backFromSearch: () => {} });
export function useRouter() {
  return useContext(RouterContext);
}
