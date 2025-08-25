import * as bcrypt from 'bcrypt';

export function hashPassword(password: string, saltRounds = 10) {
  return bcrypt.hash(password, saltRounds);
}

export function comparePasswords(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}
