export interface AuditMetadata {
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  deletedAt?: Date | null;
}
