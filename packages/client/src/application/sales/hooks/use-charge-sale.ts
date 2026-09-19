import { useReducer } from "react";
import type { CustomerSummary } from "@fludge/client/application/customer/domain/customer.repository";

type State = {
  selectedCustomer: CustomerSummary | null;
  customerTab: "walk-in" | "customer";
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
        customerTab: action.payload,
      };

    case "set-payment-type":
      return {
        ...state,
        paymentType: state.customerTab === "walk-in" ? "cash" : action.payload,
      };

    case "set-selected-customer":
      return {
        ...state,
        selectedCustomer:
          state.customerTab === "customer" ? action.payload : null,
      };
    case "reset":
      return {
        selectedCustomer: null,
        customerTab: "walk-in",
        paymentType: "cash",
      };
    default:
      return state;
  }
}

export function useChargeSale() {
  const [state, dispatch] = useReducer(reducer, {
    selectedCustomer: null,
    customerTab: "walk-in",
    paymentType: "cash",
  });

  function getEffectiveState() {
    return {
      paymentType: state.customerTab === "walk-in" ? "cash" : state.paymentType,
      selectedCustomer:
        state.customerTab === "customer" ? state.selectedCustomer : null,
    };
  }

  return {
    state,
    dispatch,
    getEffectiveState,
  };
}
