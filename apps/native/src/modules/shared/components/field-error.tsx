import { useMemo } from "react";
import { FieldError as HeroFieldError } from "heroui-native/field-error";
import { useTranslation } from "react-i18next";
import type { TranslationKey } from "@fludge/i18n/index";

type FieldErrorProps = React.ComponentProps<typeof HeroFieldError> & {
  errors?: Array<{ message?: string } | undefined>;
};

export function FieldError({
  className,
  classNames,
  children,
  errors,
  ...props
}: FieldErrorProps) {
  const { t } = useTranslation();

  // console.log(t("validators.auth.email.invalid"));

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
        (error) => `\u2022 ${error ? t(error.message as TranslationKey) : ""}`
      )
      .join("\n");
  }, [children, errors]);

  if (!content) {
    return null;
  }

  return (
    <HeroFieldError
      isInvalid
      className={className}
      classNames={classNames}
      {...props}
    >
      {content}
    </HeroFieldError>
  );
}
