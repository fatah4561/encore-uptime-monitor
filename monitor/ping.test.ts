import { describe, expect, test } from "vitest";
import { ping } from "./ping";

interface TestCase {
  site: string;
  expected: boolean;
}

describe("ping", () => {
  const testCases: TestCase[] = [
    { site: "google.com", expected: true },
    { site: "https://encore.dev", expected: true },
    { site: "https://not-a-real-site.xyz", expected: false },
    { site: "invalid://scheme", expected: false },
  ];

  test.each(testCases)(
    ({ site, expected }) => `should verify that ${site} is ${expected ? "up" : "down"}`,
    async ({ site, expected }: TestCase) => {
      const resp = await ping({ url: site });
      expect(resp.up).toBe(expected);
    }
  );
});

