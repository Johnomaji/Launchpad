class UserNotFoundError extends Error {
  constructor() {
    super("User not found");
    this.name = "UserNotFoundError";
    this.statusCode = 404;
  }
}

class MemecoinExistsError extends Error {
  constructor() {
    super("Memecoin already exists");
    this.name = "MemecoinExistsError";
    this.statusCode = 400;
  }
}

module.exports = { UserNotFoundError, MemecoinExistsError };
