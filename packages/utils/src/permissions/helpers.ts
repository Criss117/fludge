import {
  allPermissions,
  allPermissionsEs,
  type AppStatement,
  type PermissionsType,
} from "./data";

type RandomPermissions = {
  -readonly [K in keyof PermissionsType]: PermissionsType[K][number][];
};

export function getRandomPermissions(): RandomPermissions {
  const result = {} as RandomPermissions;

  (Object.keys(allPermissions) as Array<keyof PermissionsType>).forEach(
    (resource) => {
      const actions = [...allPermissions[resource]] as string[];

      // Baraja el array (Fisher-Yates)
      for (let i = actions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = actions[i]!;
        actions[i] = actions[j]!;
        actions[j] = temp;
      }

      const count = Math.floor(Math.random() * (actions.length + 1));

      result[resource] = actions.slice(0, count) as any;
    },
  );

  return result;
}

type PermissionKey = keyof typeof allPermissions;

type FormattedStatement = {
  [K in PermissionKey]?: string;
};

export function formatStatement(statement: AppStatement): FormattedStatement {
  const result: FormattedStatement = {};

  (Object.keys(statement) as PermissionKey[]).forEach((key) => {
    const actions = statement[key] as readonly string[] | undefined;

    if (!actions || actions.length === 0) return;

    const fullList = allPermissions[key] as readonly string[];

    // ordenamos según el orden "canónico" definido en allPermissions
    const ordered = fullList.filter((a) => actions.includes(a));

    const isFull = ordered.length === fullList.length;

    result[key] = isFull ? "full" : ordered.join("/");
  });

  return result;
}

export function formatStatementEs(
  statement: AppStatement,
  options?: { translateKeys?: boolean; fullLabel?: string },
): Record<string, string> {
  const { translateKeys = false, fullLabel = "completo" } = options ?? {};
  const result: Record<string, string> = {};

  (Object.keys(statement) as PermissionKey[]).forEach((key) => {
    const actions = statement[key] as readonly string[] | undefined;

    if (!actions || actions.length === 0) return;

    const fullList = allPermissions[key] as readonly string[];
    const translations = allPermissionsEs[key].values as Record<string, string>;

    // ordenamos según el orden "canónico" definido en allPermissions
    const ordered = fullList.filter((a) => actions.includes(a));

    const isFull = ordered.length === fullList.length;

    const translatedActions = ordered
      .map((a) => translations[a] ?? a)
      .join("/");

    const finalKey = translateKeys ? allPermissionsEs[key].es : key;

    result[finalKey] = isFull ? fullLabel : translatedActions;
  });

  return result;
}
