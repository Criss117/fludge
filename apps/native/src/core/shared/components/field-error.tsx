import { useMemo } from "react";
import { ThemedNativeText, ThemedText } from "./themed-text";
import { useTranslation } from "react-i18next";
import type { TranslationKey } from "@fludge/i18n/index";

type NativeFieldErrorProps = React.ComponentProps<typeof ThemedNativeText> & {
  errors?: Array<{ message?: string } | undefined>;
};

type FieldErrorProps = React.ComponentProps<typeof ThemedText> & {
  errors?: Array<{ message?: string } | undefined>;
};

function useContent({
  children,
  errors,
}: {
  children?: React.ReactNode;
  errors?: Array<{ message?: string } | undefined>;
}) {
  const { t } = useTranslation();

  const content = useMemo(() => {
    if (children) {
      return children;
    }
    if (!errors?.length) {
      return null;
    }

    const uniqueErrors = [
      ...new Map(errors.map((error) => [error?.message, error])).values(),
    ].filter((error) => error?.message);

    if (uniqueErrors.length === 0) {
      return null;
    }
    if (uniqueErrors.length === 1) {
      return uniqueErrors[0]?.message
        ? t(uniqueErrors[0].message as TranslationKey)
        : "";
    }

    // RN no soporta <ul>/<li>; usamos viñetas de texto separadas por saltos de línea.
    return uniqueErrors
      .map(
        (error) => `\u2022 ${error ? t(error.message as TranslationKey) : ""}`,
      )
      .join("\n");
  }, [children, errors]);

  return content;
}

export function NativeFieldError({
  children,
  errors,
  ...props
}: NativeFieldErrorProps) {
  const content = useContent({ children, errors });

  if (!content) return null;

  return (
    <ThemedNativeText {...props} variant="error">
      {content}
    </ThemedNativeText>
  );
}

export function FieldError({ children, errors, ...props }: FieldErrorProps) {
  const content = useContent({ children, errors });

  if (!content) return null;

  return (
    <ThemedText {...props} variant="error">
      {content}
    </ThemedText>
  );
}
