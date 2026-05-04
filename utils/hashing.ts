import bcrypt from "bcrypt";

// hashing function
async function hashPass(plainPass: string): Promise<string> {
  const saltRounds = 10;
  const hashedPass = await bcrypt.hash(plainPass, saltRounds);
  return hashedPass;
}

// comparing function
async function comparePasswords(
  pass: string,
  hashedPass: string
): Promise<boolean> {
  try {
    const isMatch = await bcrypt.compare(pass, hashedPass);
    return isMatch;
  } catch (err) {
    return false;
  }
}

export { hashPass, comparePasswords };
