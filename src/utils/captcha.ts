interface CaptchaChallenge {
  challenge: string;
  answer: number;
  userAnswer: string;
}

const generateRandomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const operators = ['+', '-', '*'] as const;
type Operator = typeof operators[number];

const generateOperation = (operator: Operator, num1: number, num2: number): number => {
  switch (operator) {
    case '+': return num1 + num2;
    case '-': return num1 - num2;
    case '*': return num1 * num2;
    default: return 0;
  }
};

export const generateCaptcha = (): CaptchaChallenge => {
  const num1 = generateRandomNumber(1, 10);
  const num2 = generateRandomNumber(1, 10);
  const operator = operators[generateRandomNumber(0, operators.length - 1)];
  
  const answer = generateOperation(operator, num1, num2);
  const challenge = `${num1} ${operator} ${num2} = ?`;

  return {
    challenge,
    answer,
    userAnswer: ''
  };
};