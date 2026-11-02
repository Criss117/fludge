import type { CustomerSummary } from "@fludge/client/commerce/domain/entities";
import { useReducer } from "react";

type State = {
  selectedCustomer: CustomerSummary | null;
  saleVariant: "walk-in" | "customer";
  paymentType: "cash" | "credit";
};

type Action =
  | {
      type: "set-customer-tab";
      payload: "walk-in" | "customer";
    }
  | {
      type: "set-payment-type";
      payload: "cash" | "credit";
    }
  | {
      type: "set-selected-customer";
      payload: CustomerSummary | null;
    }
  | {
      type: "reset";
    };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "set-customer-tab":
      return {
        ...state,
        paymentType: action.payload === "customer" ? "credit" : "cash",
        saleVariant: action.payload,
      };

    case "set-payment-type":
      return {
        ...state,
        paymentType: state.saleVariant === "walk-in" ? "cash" : action.payload,
      };

    case "set-selected-customer":
      return {
        ...state,
        selectedCustomer: state.saleVariant === "customer" ? action.payload : null,
      };
    case "reset":
      return {
        selectedCustomer: null,
        saleVariant: "walk-in",
        paymentType: "cash",
      };
    default:
      return state;
  }
}

export function useChargeSale() {
  const [state, dispatch] = useReducer(reducer, {
    selectedCustomer: null,
    saleVariant: "walk-in",
    paymentType: "cash",
  });

  function getEffectiveState() {
    return {
      paymentType:
        state.saleVariant === "walk-in"
          ? "cash"
          : state.selectedCustomer
            ? state.paymentType
            : "cash",
      selectedCustomer: state.saleVariant === "customer" ? state.selectedCustomer : null,
    };
  }

  return {
    state,
    dispatch,
    getEffectiveState,
  };
}
