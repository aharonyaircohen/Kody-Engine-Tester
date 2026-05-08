import { sayHello } from './say-hello'
import { sayGoodbye } from './say-goodbye'

export function sayBoth(name: string): string {
  return `${sayHello(name)} And finally: ${sayGoodbye(name)}`
}
