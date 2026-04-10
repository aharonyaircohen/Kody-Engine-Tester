export default function sum(numbers: number[]): number {
  return numbers.reduce((acc, num) => acc + num, 0)
}