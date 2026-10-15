import { createContext, useContext } from "react";
export type Router = { url: string; go: (url: string) => void; backFromSearch: () => void; hasReturnOrigin: boolean; learningHome: boolean };
export const RouterContext = createContext<Router>({ url: "/", go: () => {}, backFromSearch: () => {}, hasReturnOrigin: false, learningHome: false });
export function useRouter() {
  return useContext(RouterContext);
}
