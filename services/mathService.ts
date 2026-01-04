
import { Question } from '../types';

const getRandomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const formatTerm = (coeff: number, power: string, isFirst = false) => {
  if (coeff === 0) return '';
  let sign = coeff > 0 ? (isFirst ? '' : ' + ') : ' - ';
  let absCoeff = Math.abs(coeff);
  let coeffStr = absCoeff === 1 && power !== '' ? '' : absCoeff.toString();
  return `${sign}${coeffStr}${power}`;
};

export const generateQuestions = (count: number = 4): Question[] => {
  const generators = [
    // Difference of Squares: B^2*x^2 - D^2*y^2
    (): Partial<Question> => {
      const B = getRandomInt(1, 10);
      const D = getRandomInt(1, 10);
      return {
        expression: `${B * B}x^2 - ${D * D}y^2`,
        expectedAnswer: `(${B}x + ${D}y)(${B}x - ${D}y)`,
        type: 'square_diff'
      };
    },
    // Perfect Square: B^2*x^2 + 2BDxy + D^2*y^2
    (): Partial<Question> => {
      const B = getRandomInt(1, 10);
      const D = getRandomInt(1, 10);
      return {
        expression: `${B * B}x^2 + ${2 * B * D}xy + ${D * D}y^2`,
        expectedAnswer: `(${B}x + ${D}y)^2`,
        type: 'perfect_square'
      };
    },
    // Simple Quadratic: x^2 + (b+d)x + bd
    (): Partial<Question> => {
      const b = getRandomInt(-10, 10);
      const d = getRandomInt(-10, 10);
      const linear = b + d;
      const constant = b * d;
      const expr = `x^2${formatTerm(linear, 'x')}${formatTerm(constant, '')}`;
      const signB = b >= 0 ? '+' : '';
      const signD = d >= 0 ? '+' : '';
      return {
        expression: expr,
        expectedAnswer: `(x ${signB} ${b})(x ${signD} ${d})`.replace(/\s+/g, ''),
        type: 'quadratic'
      };
    },
    // General Quadratic: ac*x^2 + (bc+ad)x + bd
    (): Partial<Question> => {
      const a = getRandomInt(1, 5);
      const b = getRandomInt(-5, 5);
      const c = getRandomInt(1, 5);
      const d = getRandomInt(-5, 5);
      const q = a * c;
      const linear = b * c + a * d;
      const constant = b * d;
      const expr = `${q}x^2${formatTerm(linear, 'x')}${formatTerm(constant, '')}`;
      const signB = b >= 0 ? '+' : '';
      const signD = d >= 0 ? '+' : '';
      return {
        expression: expr,
        expectedAnswer: `(${a}x ${signB} ${b})(${c}x ${signD} ${d})`.replace(/\s+/g, ''),
        type: 'general_quad'
      };
    }
  ];

  const results: Question[] = [];
  for (let i = 0; i < count; i++) {
    const gen = generators[i % generators.length];
    results.push({ id: i, ...gen() } as Question);
  }

  // Shuffle
  return results.sort(() => Math.random() - 0.5);
};
