import { sayHello } from './say-hello'

export function sayGoodbye(name: string): string {
  return `${sayHello(name)} Goodbye, ${name}!`
}
