import { describe, it, expect } from "vitest"
import { sum } from "./math"

describe("sum", () => {
  it("should return the sum of two numbers", () => {
    expect(sum(1, 2)).toBe(4)
    expect(sum(-1, 1)).toBe(0)
    expect(sum(0, 0)).toBe(0)
    expect(sum(-5, -5)).toBe(-10)
  })

  it("should handle floating point numbers", () => {
    expect(sum(1.5, 2.5)).toBe(4)
    expect(sum(-1.5, 1.5)).toBe(0)
  })
})
