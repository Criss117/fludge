import { describe, expect, it } from "bun:test";
import { CantRemoveOwnerException } from "../src/modules/iam/organization/domain/exceptions/cant-remove-owner.exception";
import { GroupAlreadyExistsException } from "../src/modules/iam/organization/domain/exceptions/group-already-exists.exception";
import { GroupMemberAlreadyExistsException } from "../src/modules/iam/organization/domain/exceptions/group-member-elready-exists.exception";
import { GroupNotFoundException } from "../src/modules/iam/organization/domain/exceptions/group-not-found.exception";
import { MemberAlreadyExistsException } from "../src/modules/iam/organization/domain/exceptions/member-already-exists.exception";
import { MemberNotFoundException } from "../src/modules/iam/organization/domain/exceptions/member-not-found.exeption";
import { OwnerNotFoundException } from "../src/modules/iam/organization/domain/exceptions/owner-not-found.exception";

describe("domain exceptions", () => {
  it("exposes the expected ORPC codes", () => {
    expect(new GroupNotFoundException().code).toBe("NOT_FOUND");
    expect(new GroupAlreadyExistsException().code).toBe("CONFLICT");
    expect(new MemberNotFoundException().code).toBe("NOT_FOUND");
    expect(new MemberAlreadyExistsException().code).toBe("CONFLICT");
    expect(new GroupMemberAlreadyExistsException().code).toBe("CONFLICT");
    expect(new CantRemoveOwnerException().code).toBe("BAD_REQUEST");
    expect(new OwnerNotFoundException().code).toBe("NOT_FOUND");
  });
  it("allows custom messages", () => {
    expect(new GroupNotFoundException("Missing group").message).toBe("Missing group");
    expect(new OwnerNotFoundException("Missing owner").message).toBe("Missing owner");
  });
});
