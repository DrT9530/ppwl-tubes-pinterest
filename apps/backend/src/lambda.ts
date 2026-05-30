// src/lambda.ts — Entry point untuk AWS Lambda (Bun Lambda Layer + HTTP API v2)
// Polyfill Headers.prototype.getAll for compatibility with legacy Bun Lambda layers
if (typeof Headers.prototype.getAll !== "function") {
  Headers.prototype.getAll = function (this: Headers, name: string) {
    if (name.toLowerCase() === "set-cookie") {
      if (typeof this.getSetCookie === "function") {
        return this.getSetCookie();
      }
      const val = this.get("set-cookie");
      return val ? [val] : [];
    }
    const val = this.get(name);
    return val ? [val] : [];
  };
}

// Polyfill Headers.prototype.toJSON for compatibility with legacy Bun Lambda layers
if (typeof Headers.prototype.toJSON !== "function") {
  Headers.prototype.toJSON = function (this: Headers) {
    const obj: Record<string, string> = {};
    this.forEach((value, key) => {
      obj[key] = value;
    });
    return obj;
  };
}

import { app } from "./app";

// Bun Lambda layer handles event<->Request/Response conversion automatically.
// With HTTP API v2, paths don't include stage prefix, so no stripping needed.
export default {
  fetch(request: Request): Promise<Response> | Response {
    return app.fetch(request);
  },
};

export { app };
