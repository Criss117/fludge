import { describe, expect, it } from "bun:test";

import { Status } from "@fludge/api/core/shared/value-objects/status";
import type { OrganizationSelect } from "@fludge/db/schema/iam.schema";
import { Slug } from "@fludge/utils/slugify";
import { UUID } from "@fludge/utils/uuid";

import { Organization } from "../../../../src/core/iam/domain/entities/organization.entity";

const CREATE_INPUT = {
  name: "  Acme  Corp.  ",
  legalName: "Acme Corporation S.A.",
  taxId: "30-71234567-8",
  address: "Av. Siempre Viva 742",
  phone: "+54 11 5555-1234",
};

const PERSISTED: OrganizationSelect = {
  id: "0192d840-7c3f-73b2-8f71-2c1b6a9e5d44",
  name: "Innovative Labs",
  slug: "innovative-labs",
  legalName: "Innovative Labs SRL",
  taxId: "30-71555444-2",
  address: "Calle Falsa 123",
  phone: "+54 351 444-5566",
  createdAt: new Date("2025-01-15T10:30:00.000Z"),
  updatedAt: new Date("2025-02-20T08:00:00.000Z"),
  status: "active",
};

describe("Organization", () => {
  describe("create", () => {
    it("creates an organization with all required values", () => {
      const values = Organization.create(CREATE_INPUT).values;

      expect(values.name).toBe(CREATE_INPUT.name);
      expect(values.legalName).toBe(CREATE_INPUT.legalName);
      expect(values.taxId).toBe(CREATE_INPUT.taxId);
      expect(values.address).toBe(CREATE_INPUT.address);
      expect(values.phone).toBe(CREATE_INPUT.phone);
    });

    it("generates a valid UUID id", () => {
      const id = Organization.create(CREATE_INPUT).id.toString();

      expect(id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
      );
    });

    it("generates a unique id for each organization", () => {
      const first = Organization.create(CREATE_INPUT).id.toString();
      const second = Organization.create(CREATE_INPUT).id.toString();

      expect(first).not.toBe(second);
    });

    it("generates a slug from the name", () => {
      const org = Organization.create(CREATE_INPUT);

      expect(org.values.slug).toBe(new Slug(CREATE_INPUT.name).toString());
      expect(org.values.slug).toBe("acme-corp");
    });

    it("sets the status to active", () => {
      const org = Organization.create(CREATE_INPUT);

      expect(org.values.status).toBe("active");
    });

    it("sets createdAt and updatedAt to the same instant", () => {
      const values = Organization.create(CREATE_INPUT).values;

      expect(values.createdAt.getTime()).toBe(values.updatedAt.getTime());
    });

    it("returns the expected plain object matching the OrganizationSelect shape", () => {
      const values = Organization.create(CREATE_INPUT).values;

      expect(values).toEqual({
        id: values.id,
        taxId: CREATE_INPUT.taxId,
        name: CREATE_INPUT.name,
        slug: new Slug(CREATE_INPUT.name).toString(),
        legalName: CREATE_INPUT.legalName,
        address: CREATE_INPUT.address,
        phone: CREATE_INPUT.phone,
        createdAt: values.createdAt,
        updatedAt: values.updatedAt,
        status: "active",
      });
    });
  });

  describe("reconstitute", () => {
    it("reconstructs an organization preserving every persisted field", () => {
      const org = Organization.reconstitute(PERSISTED);
      const values = org.values;

      expect(values.id).toBe(PERSISTED.id);
      expect(values.taxId).toBe(PERSISTED.taxId);
      expect(values.name).toBe(PERSISTED.name);
      expect(values.slug).toBe(PERSISTED.slug);
      expect(values.legalName).toBe(PERSISTED.legalName);
      expect(values.address).toBe(PERSISTED.address);
      expect(values.phone).toBe(PERSISTED.phone);
      expect(values.createdAt).toEqual(PERSISTED.createdAt);
      expect(values.updatedAt).toEqual(PERSISTED.updatedAt);
      expect(values.status).toBe(PERSISTED.status);
    });

    it("returns the same data passed in through the values getter", () => {
      expect(Organization.reconstitute(PERSISTED).values).toEqual(PERSISTED);
    });

    it("reconstitutes an inactive status", () => {
      const org = Organization.reconstitute({ ...PERSISTED, status: "inactive" });

      expect(org.values.status).toBe("inactive");
    });
  });

  describe("getters", () => {
    it("returns the id as a UUID instance", () => {
      const org = Organization.create(CREATE_INPUT);

      expect(org.id).toBeInstanceOf(UUID);
    });

    it("returns the status as a Status instance with value active", () => {
      const org = Organization.create(CREATE_INPUT);

      expect(org.status).toBeInstanceOf(Status);
      expect(org.status.value).toBe("active");
      expect(org.status.isActive()).toBe(true);
    });

    it("returns the reconstituted status", () => {
      const org = Organization.reconstitute({ ...PERSISTED, status: "inactive" });

      expect(org.status).toBeInstanceOf(Status);
      expect(org.status.value).toBe("inactive");
      expect(org.status.isInactive()).toBe(true);
    });
  });

  describe("touch", () => {
    it("updates updatedAt to a newer instant", () => {
      const org = Organization.create(CREATE_INPUT);
      const before = org.values.updatedAt.getTime();

      org.touch();

      expect(org.values.updatedAt.getTime()).toBeGreaterThanOrEqual(before);
    });

    it("does not change createdAt", () => {
      const org = Organization.create(CREATE_INPUT);
      const createdAt = org.values.createdAt;

      org.touch();

      expect(org.values.createdAt).toEqual(createdAt);
    });

    it("does not change any other field", () => {
      const org = Organization.create(CREATE_INPUT);
      const before = org.values;

      org.touch();

      expect(org.values.id).toBe(before.id);
      expect(org.values.taxId).toBe(before.taxId);
      expect(org.values.name).toBe(before.name);
      expect(org.values.slug).toBe(before.slug);
      expect(org.values.legalName).toBe(before.legalName);
      expect(org.values.address).toBe(before.address);
      expect(org.values.phone).toBe(before.phone);
      expect(org.values.status).toBe(before.status);
    });
  });

  describe("update", () => {
    it("updates the name and regenerates the slug when the name is provided", () => {
      const org = Organization.create(CREATE_INPUT);

      org.update({ name: "Bright Ideas LLC" });

      expect(org.values.name).toBe("Bright Ideas LLC");
      expect(org.values.slug).toBe("bright-ideas-llc");
      expect(org.values.slug).toBe(new Slug("Bright Ideas LLC").toString());
    });

    it("updates legalName when provided", () => {
      const org = Organization.create(CREATE_INPUT);

      org.update({ legalName: "Acme Corporation Holding" });

      expect(org.values.legalName).toBe("Acme Corporation Holding");
    });

    it("updates address when provided", () => {
      const org = Organization.create(CREATE_INPUT);

      org.update({ address: "Nueva Dirección 456" });

      expect(org.values.address).toBe("Nueva Dirección 456");
    });

    it("updates phone when provided", () => {
      const org = Organization.create(CREATE_INPUT);

      org.update({ phone: "+54 11 6666-7788" });

      expect(org.values.phone).toBe("+54 11 6666-7788");
    });

    it("updates multiple fields at once", () => {
      const org = Organization.create(CREATE_INPUT);

      org.update({
        name: "Bright Ideas LLC",
        legalName: "Bright Ideas Holdings S.A.",
        address: "Calle Nueva 789",
        phone: "+1 555 0100",
      });

      const values = org.values;
      expect(values.name).toBe("Bright Ideas LLC");
      expect(values.slug).toBe(new Slug("Bright Ideas LLC").toString());
      expect(values.legalName).toBe("Bright Ideas Holdings S.A.");
      expect(values.address).toBe("Calle Nueva 789");
      expect(values.phone).toBe("+1 555 0100");
    });

    it("calls touch so updatedAt changes", () => {
      const org = Organization.create(CREATE_INPUT);
      const before = org.values.updatedAt.getTime();

      org.update({ name: "Bright Ideas LLC" });

      expect(org.values.updatedAt.getTime()).toBeGreaterThanOrEqual(before);
    });

    it("does not change taxId", () => {
      const org = Organization.create(CREATE_INPUT);
      const taxId = org.values.taxId;

      org.update({
        name: "Bright Ideas LLC",
        legalName: "Bright Ideas Holdings S.A.",
        address: "Calle Nueva 789",
        phone: "+1 555 0100",
      });

      expect(org.values.taxId).toBe(taxId);
    });

    it("does not change any field when passed an empty object", () => {
      const org = Organization.create(CREATE_INPUT);
      const before = org.values;

      org.update({});

      expect(org.values.id).toBe(before.id);
      expect(org.values.taxId).toBe(before.taxId);
      expect(org.values.name).toBe(before.name);
      expect(org.values.slug).toBe(before.slug);
      expect(org.values.legalName).toBe(before.legalName);
      expect(org.values.address).toBe(before.address);
      expect(org.values.phone).toBe(before.phone);
      expect(org.values.status).toBe(before.status);
    });

    it("still calls touch so updatedAt changes even for an empty object", () => {
      const org = Organization.create(CREATE_INPUT);
      const before = org.values.updatedAt.getTime();

      org.update({});

      expect(org.values.updatedAt.getTime()).toBeGreaterThanOrEqual(before);
    });

    it("does not change fields not provided", () => {
      const org = Organization.create(CREATE_INPUT);
      const before = org.values;

      org.update({ legalName: "Acme Corporation Holding" });

      expect(org.values.name).toBe(before.name);
      expect(org.values.slug).toBe(before.slug);
      expect(org.values.address).toBe(before.address);
      expect(org.values.phone).toBe(before.phone);
      expect(org.values.legalName).toBe("Acme Corporation Holding");
    });
  });
});