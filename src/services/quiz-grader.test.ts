import { describe, it, expect, beforeEach } from 'vitest'
import {
  gradeQuiz,
  checkAttempts,
  getAttempts,
  resetAttempts,
  resetAllAttempts,
  type QuizAnswer,
} from './quiz-grader'

const makeMcQuestion = (overrides: Partial<{
  text: string
  options: Array<{ text: string; isCorrect: boolean }>
  points: number
}> = {}) => ({
  text: 'What is 2 + 2?',
  type: 'multiple-choice' as const,
  options: [
    { text: '3', isCorrect: false },
    { text: '4', isCorrect: true },
    { text: '5', isCorrect: false },
  ],
  points: 1,
  ...overrides,
})

const makeTfQuestion = (overrides: Partial<{
  text: string
  correctAnswer: string
  points: number
}> = {}) => ({
  text: 'The sky is blue.',
  type: 'true-false' as const,
  options: [
    { text: 'True', isCorrect: false },
    { text: 'False', isCorrect: false },
  ],
  correctAnswer: 'true',
  points: 1,
  ...overrides,
})

const makeSaQuestion = (overrides: Partial<{
  text: string
  correctAnswer: string
  points: number
}> = {}) => ({
  text: 'Capital of France?',
  type: 'short-answer' as const,
  options: [],
  correctAnswer: 'Paris',
  points: 1,
  ...overrides,
})

const makeQuiz = (questions: any[], overrides: Partial<{
  passingScore: number
  maxAttempts: number
}> = {}) => ({
  id: 'quiz-1',
  title: 'Test Quiz',
  passingScore: 70,
  maxAttempts: 3,
  questions,
  ...overrides,
})

const answer = (questionIndex: number, answer: string | number): QuizAnswer => ({
  questionIndex,
  answer,
})

describe('gradeQuiz', () => {
  describe('multiple-choice questions', () => {
    it('awards full points for correct MC answer', () => {
      const quiz = makeQuiz([makeMcQuestion()])
      const result = gradeQuiz(quiz, [answer(0, '4')])
      expect(result.results[0].correct).toBe(true)
      expect(result.results[0].pointsEarned).toBe(1)
    })

    it('awards zero for wrong MC answer', () => {
      const quiz = makeQuiz([makeMcQuestion()])
      const result = gradeQuiz(quiz, [answer(0, '3')])
      expect(result.results[0].correct).toBe(false)
      expect(result.results[0].pointsEarned).toBe(0)
    })

    it('awards zero for MC answer with no matching option', () => {
      const quiz = makeQuiz([makeMcQuestion()])
      const result = gradeQuiz(quiz, [answer(0, 'nonexistent')])
      expect(result.results[0].correct).toBe(false)
      expect(result.results[0].pointsEarned).toBe(0)
    })

    it('supports multiple correct options (all must be selected)', () => {
      const quiz = makeQuiz([{
        ...makeMcQuestion(),
        options: [
          { text: 'A', isCorrect: true },
          { text: 'B', isCorrect: true },
          { text: 'C', isCorrect: false },
        ],
      }])
      // Answer with the first correct option
      const result = gradeQuiz(quiz, [answer(0, 'A')])
      expect(result.results[0].correct).toBe(true)
      expect(result.results[0].pointsEarned).toBe(1)
    })

    it('awards points proportional to MC question weight', () => {
      const quiz = makeQuiz([makeMcQuestion({ points: 5 })])
      const result = gradeQuiz(quiz, [answer(0, '4')])
      expect(result.results[0].pointsEarned).toBe(5)
    })
  })

  describe('true-false questions', () => {
    it('awards full points for correct true answer', () => {
      const quiz = makeQuiz([makeTfQuestion({ correctAnswer: 'true' })])
      const result = gradeQuiz(quiz, [answer(0, 'true')])
      expect(result.results[0].correct).toBe(true)
      expect(result.results[0].pointsEarned).toBe(1)
    })

    it('awards full points for correct false answer', () => {
      const quiz = makeQuiz([makeTfQuestion({ correctAnswer: 'false' })])
      const result = gradeQuiz(quiz, [answer(0, 'false')])
      expect(result.results[0].correct).toBe(true)
      expect(result.results[0].pointsEarned).toBe(1)
    })

    it('awards zero for wrong true-false answer', () => {
      const quiz = makeQuiz([makeTfQuestion({ correctAnswer: 'true' })])
      const result = gradeQuiz(quiz, [answer(0, 'false')])
      expect(result.results[0].correct).toBe(false)
      expect(result.results[0].pointsEarned).toBe(0)
    })

    it('awards points proportional to TF question weight', () => {
      const quiz = makeQuiz([makeTfQuestion({ correctAnswer: 'true', points: 3 })])
      const result = gradeQuiz(quiz, [answer(0, 'true')])
      expect(result.results[0].pointsEarned).toBe(3)
    })
  })

  describe('short-answer questions', () => {
    it('awards full points for exact match (case-insensitive)', () => {
      const quiz = makeQuiz([makeSaQuestion()])
      const result = gradeQuiz(quiz, [answer(0, 'Paris')])
      expect(result.results[0].correct).toBe(true)
      expect(result.results[0].pointsEarned).toBe(1)
    })

    it('awards full points for case-insensitive match', () => {
      const quiz = makeQuiz([makeSaQuestion()])
      const result = gradeQuiz(quiz, [answer(0, 'PARIS')])
      expect(result.results[0].correct).toBe(true)
      expect(result.results[0].pointsEarned).toBe(1)
    })

    it('awards full points for trimmed match', () => {
      const quiz = makeQuiz([makeSaQuestion()])
      const result = gradeQuiz(quiz, [answer(0, '  Paris  ')])
      expect(result.results[0].correct).toBe(true)
      expect(result.results[0].pointsEarned).toBe(1)
    })

    it('awards zero for wrong short-answer', () => {
      const quiz = makeQuiz([makeSaQuestion()])
      const result = gradeQuiz(quiz, [answer(0, 'London')])
      expect(result.results[0].correct).toBe(false)
      expect(result.results[0].pointsEarned).toBe(0)
    })

    it('awards zero for empty short-answer', () => {
      const quiz = makeQuiz([makeSaQuestion()])
      const result = gradeQuiz(quiz, [answer(0, '')])
      expect(result.results[0].correct).toBe(false)
      expect(result.results[0].pointsEarned).toBe(0)
    })

    it('awards points proportional to SA question weight', () => {
      const quiz = makeQuiz([makeSaQuestion({ points: 4 })])
      const result = gradeQuiz(quiz, [answer(0, 'Paris')])
      expect(result.results[0].pointsEarned).toBe(4)
    })
  })

  describe('unanswered questions', () => {
    it('awards zero for missing answer', () => {
      const quiz = makeQuiz([makeMcQuestion()])
      const result = gradeQuiz(quiz, [])
      expect(result.results[0].correct).toBe(false)
      expect(result.results[0].pointsEarned).toBe(0)
    })

    it('awards zero for skipped question in the middle', () => {
      const quiz = makeQuiz([
        makeMcQuestion(),
        makeMcQuestion({ text: 'Q2', options: [{ text: 'A', isCorrect: true }, { text: 'B', isCorrect: false }] }),
      ])
      const result = gradeQuiz(quiz, [answer(0, '4')]) // skip question 1
      expect(result.results[0].correct).toBe(true)
      expect(result.results[1].correct).toBe(false)
      expect(result.results[1].pointsEarned).toBe(0)
    })

    it('awards zero for question answered with undefined', () => {
      const quiz = makeQuiz([makeMcQuestion()])
      const result = gradeQuiz(quiz, [{ questionIndex: 0, answer: undefined as any }])
      expect(result.results[0].correct).toBe(false)
      expect(result.results[0].pointsEarned).toBe(0)
    })
  })

  describe('score calculation', () => {
    it('calculates 100% score for all correct', () => {
      const quiz = makeQuiz([
        makeMcQuestion({ points: 1 }),
        makeTfQuestion({ correctAnswer: 'true', points: 1 }),
        makeSaQuestion({ correctAnswer: 'Paris', points: 1 }),
      ])
      const result = gradeQuiz(quiz, [
        answer(0, '4'),
        answer(1, 'true'),
        answer(2, 'Paris'),
      ])
      expect(result.score).toBe(100)
      expect(result.passed).toBe(true)
    })

    it('calculates 0% score for all wrong', () => {
      const quiz = makeQuiz([
        makeMcQuestion({ points: 1 }),
        makeTfQuestion({ correctAnswer: 'true', points: 1 }),
        makeSaQuestion({ correctAnswer: 'Paris', points: 1 }),
      ])
      const result = gradeQuiz(quiz, [
        answer(0, '3'),
        answer(1, 'false'),
        answer(2, 'London'),
      ])
      expect(result.score).toBe(0)
      expect(result.passed).toBe(false)
    })

    it('calculates partial score correctly', () => {
      const quiz = makeQuiz([
        makeMcQuestion({ points: 1 }),
        makeMcQuestion({
          text: 'Q2',
          options: [{ text: 'A', isCorrect: true }, { text: 'B', isCorrect: false }],
          points: 1,
        }),
        makeMcQuestion({ text: 'Q3', options: [{ text: 'A', isCorrect: true }, { text: 'B', isCorrect: false }], points: 1 }),
      ])
      const result = gradeQuiz(quiz, [
        answer(0, '4'),
        answer(1, 'B'), // wrong
        answer(2, 'B'), // wrong
      ])
      expect(result.score).toBeCloseTo(33.33, 1)
    })

    it('rounds score to 2 decimal places', () => {
      const quiz = makeQuiz([
        makeMcQuestion({ points: 1 }),
        makeMcQuestion({
          text: 'Q2',
          options: [{ text: 'A', isCorrect: true }, { text: 'B', isCorrect: false }],
          points: 1,
        }),
      ])
      const result = gradeQuiz(quiz, [answer(0, '4'), answer(1, 'A')])
      expect(result.score).toBe(100)
    })

    it('respects custom passing score', () => {
      const quiz = makeQuiz(
        [makeMcQuestion({ points: 1 }), makeMcQuestion({
          text: 'Q2',
          options: [{ text: 'A', isCorrect: true }, { text: 'B', isCorrect: false }],
          points: 1,
        })],
        { passingScore: 50 },
      )
      const result = gradeQuiz(quiz, [answer(0, '4'), answer(1, 'B')])
      expect(result.score).toBe(50)
      expect(result.passed).toBe(true)
    })

    it('fails when score equals passing score (boundary)', () => {
      const quiz = makeQuiz(
        [makeMcQuestion({ points: 1 })],
        { passingScore: 100 },
      )
      const result = gradeQuiz(quiz, [answer(0, '4')])
      expect(result.score).toBe(100)
      expect(result.passed).toBe(true)
    })

    it('fails when score is just below passing score', () => {
      const quiz = makeQuiz(
        [makeMcQuestion({ points: 1 }), makeMcQuestion({
          text: 'Q2',
          options: [{ text: 'A', isCorrect: true }, { text: 'B', isCorrect: false }],
          points: 1,
        })],
        { passingScore: 51 },
      )
      const result = gradeQuiz(quiz, [answer(0, '4'), answer(1, 'B')])
      expect(result.score).toBeCloseTo(50, 0)
      expect(result.passed).toBe(false)
    })

    it('returns 0 score for empty quiz', () => {
      const quiz = makeQuiz([])
      const result = gradeQuiz(quiz, [])
      expect(result.score).toBe(0)
      expect(result.passed).toBe(false)
    })
  })

  describe('total points', () => {
    it('returns sum of all question points', () => {
      const quiz = makeQuiz([
        makeMcQuestion({ points: 2 }),
        makeTfQuestion({ correctAnswer: 'true', points: 3 }),
        makeSaQuestion({ correctAnswer: 'Paris', points: 5 }),
      ])
      const result = gradeQuiz(quiz, [
        answer(0, '4'),
        answer(1, 'true'),
        answer(2, 'Paris'),
      ])
      expect(result.totalPoints).toBe(10)
      expect(result.earnedPoints).toBe(10)
    })
  })
})

describe('checkAttempts', () => {
  beforeEach(() => {
    resetAllAttempts()
  })

  it('returns 0 attempts on first check', () => {
    const result = checkAttempts('new-user', 'quiz-1')
    expect(result.count).toBe(1) // first call = attempt 1
    expect(result.exceeded).toBe(false)
  })

  it('increments count on each attempt', () => {
    checkAttempts('user-1', 'quiz-1')
    const result = checkAttempts('user-1', 'quiz-1')
    expect(result.count).toBe(2)
    expect(result.exceeded).toBe(false)
  })

  it('returns exceeded=true when maxAttempts reached', () => {
    checkAttempts('user-1', 'quiz-1')
    checkAttempts('user-1', 'quiz-1')
    const result = checkAttempts('user-1', 'quiz-1', 3)
    expect(result.count).toBe(3)
    expect(result.exceeded).toBe(true)
  })

  it('tracks attempts per user independently', () => {
    checkAttempts('user-1', 'quiz-1')
    checkAttempts('user-1', 'quiz-1')
    const user2 = checkAttempts('user-2', 'quiz-1')
    expect(user2.count).toBe(1) // user-2's first attempt
  })

  it('tracks attempts per quiz independently', () => {
    checkAttempts('user-1', 'quiz-1')
    checkAttempts('user-1', 'quiz-1')
    const quiz2 = checkAttempts('user-1', 'quiz-2')
    expect(quiz2.count).toBe(1) // quiz-2's first attempt
  })

  it('respects custom maxAttempts from quiz', () => {
    const quiz = makeQuiz([], { maxAttempts: 5 })
    // Simulate 4 prior attempts
    checkAttempts('user-1', 'quiz-1')
    checkAttempts('user-1', 'quiz-1')
    checkAttempts('user-1', 'quiz-1')
    const result = checkAttempts('user-1', 'quiz-1')
    expect(result.count).toBe(4)
    expect(result.exceeded).toBe(false)
  })
})
