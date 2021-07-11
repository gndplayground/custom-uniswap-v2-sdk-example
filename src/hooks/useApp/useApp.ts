import { useContext } from "react";
import { AppContext } from "../../providers/AppProvider";

export default function useApp() {
  return useContext(AppContext);
}
