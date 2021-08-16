import type { ContractToken } from "advantage/api/types";

export type SelectedToken = ContractToken | null;

export type SetSelectedToken = (token: ContractToken | null) => void;
