export class ShortCodeCollisionError extends Error {
  constructor() {
    super("Short code collision");
    this.name = "ShortCodeCollisionError";
  }
}