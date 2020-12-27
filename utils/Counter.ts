/* ==== Begin tests ==== */
export class Counter {
  public counter: Record<string, number> = {}
  update = (key: string) => (val: any, prevVal: any) => {
    this.counter[key] = (this.counter[key] || 0) + 1
  }
  reset() {
    this.counter = {}
  }
}
