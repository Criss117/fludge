import { useFindActiveOrganization } from "@fludge/client/application/iam/organization/queries/use-find-organization";
import { useOrpc } from "@fludge/client/providers/orpc.provider";

type Orpc = ReturnType<typeof useOrpc>;
type ResourceName = "categories" | "products" | "products-presentations";

const isDev = process.env.NODE_ENV !== "production";
let version = 0;

function buildKey(resourceName: ResourceName, organizationId: string) {
  if (isDev) {
    return {
      id: `organizations/${organizationId}/${resourceName}/dev/${version++}`,
      queryKey: [
        "organizations",
        organizationId,
        resourceName,
        "dev",
        version.toString(),
      ],
    };
  }

  return {
    id: `organizations/${organizationId}/${resourceName}`,
    queryKey: ["organizations", organizationId, resourceName],
  };
}

const allCaches = new Map<ResourceName, Map<string, unknown>>();

export function createResourceCollection<T>(
  resourceName: ResourceName,
  buildCollectionOptions: (
    key: { id: string; queryKey: string[] },
    orpc: Orpc,
  ) => T,
) {
  if (!allCaches.has(resourceName)) {
    allCaches.set(resourceName, new Map());
  }

  const cache = allCaches.get(resourceName)! as Map<string, T>;

  function collectionBuilder(activeOrganizationId: string, orpc: Orpc) {
    const key = buildKey(resourceName, activeOrganizationId);
    return buildCollectionOptions(key, orpc);
  }

  function getCollection(activeOrganizationId: string, orpc: Orpc) {
    if (!cache.has(activeOrganizationId)) {
      cache.set(
        activeOrganizationId,
        collectionBuilder(activeOrganizationId, orpc),
      );
    }
    return cache.get(activeOrganizationId)!;
  }

  function useCollection() {
    const orpc = useOrpc();
    const { data: activeOrganization } = useFindActiveOrganization();

    if (!activeOrganization) {
      throw new Error("Es necesario que exista una organización activa");
    }

    const collection = getCollection(activeOrganization.id, orpc);

    return { collection, activeOrganization };
  }

  return {
    cache,
    collectionBuilder,
    getCollection,
    useCollection,
  };
}

export function listRegisteredResources(): ResourceName[] {
  return [...allCaches.keys()];
}

export function resetResource(resourceName: ResourceName) {
  allCaches.get(resourceName)?.clear();
  version++;
}

export function resetAllResources() {
  allCaches.forEach((cache) => cache.clear());
  version++;
}
