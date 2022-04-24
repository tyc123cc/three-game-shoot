/**
 * 堆数据结构
 */
export class Heap<E>{
  /**
   * 堆中的数据
   */
  public data: E[]

  private isMin: boolean

  /**
   * 对比函数
   */
  private compare: (a: E, b: E) => boolean;

  /**
   * 
   * @param isMin 是否小顶堆
   * @param data 堆中的初始数据
   * @param compare 对比函数，若a小于b，返回true
   */
  constructor(isMin: boolean = true, data: E[] = [], compare: (a: E, b: E) => boolean = (a: E, b: E) => { return a < b }) {
    this.data = data
    this.isMin = isMin
    this.compare = compare;
    if (this.data.length > 0) this.heapify()
  }
  private swap(i: number, j: number) {
    const temp = this.data[i]
    this.data[i] = this.data[j]
    this.data[j] = temp
  }

  private arg1Small(child: number, parent: number): boolean {
    return this.isMin ? this.compare(this.data[child], this.data[parent]) : this.compare(this.data[parent], this.data[child])
  }
  private parentIndex(i: number): number {
    return i >> 1
  }
  private leftChildIndex(i: number): number {
    return (i << 1) + 1
  }
  private rightChildIndex(i: number): number {
    return (i << 1) + 2
  }
  private shiftUp(child: number) {
    if (child === 0) return
    const parent = this.parentIndex(child)
    if (this.arg1Small(child, parent)) {
      this.swap(child, parent)
      this.shiftUp(parent)
    }
  }
  private shiftDown(parent: number) {
    const left = this.leftChildIndex(parent)
      , right = this.rightChildIndex(parent)
    if (this.size <= left) return
    const child = this.arg1Small(left, right) ? left : right
    if (this.arg1Small(child, parent)) {
      this.swap(child, parent)
      this.shiftDown(child)
    }
  }
  get size(): number {
    return this.data.length
  }
  peek(): E | false {
    return this.size > 0 ? this.data[0] : false
  }

  /**
   * Pop顶堆值
   * @returns 顶堆的值
   */
  pop(): boolean {
    if (this.size < 1) return false;
    const val = <E>this.data.pop()
    if (this.size >= 1) {
      this.data[0] = val
      this.shiftDown(0)
    }
    return true
  }
  /**
   * 插入数值
   * @param val 数值
   */
  insert(val: E) {
    this.data.push(val)
    this.shiftUp(this.size - 1)
  }

  /**
   * 堆重新排序
   */
  heapify() {
    let len = this.size
    while (len--) this.shiftUp(len - 1)
  }
}