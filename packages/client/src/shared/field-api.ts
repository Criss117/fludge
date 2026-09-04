export interface MinimalField<TValue = string> {
  state: {
    value: TValue;
    meta: {
      isTouched: boolean;
      isValid: boolean;
      errors: Array<{ message?: string } | undefined>;
    };
  };
  handleChange: (value: TValue) => void;
  handleBlur: () => void;
}
