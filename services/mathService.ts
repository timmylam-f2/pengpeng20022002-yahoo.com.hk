
import { Question, Difficulty } from '../types';

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

export const generateQuestions = (difficulty: Difficulty, count: number = 4): Question[] => {
  const generators = {
    EASY: [
      // Easy Difference of Squares: x^2 - D^2
      (): Partial<Question> => {
        const D = getRandomInt(1, 10);
        return {
          expression: `x^2 - ${D * D}`,
          expectedAnswer: `(x + ${D})(x - ${D})`,
          type: 'square_diff'
        };
      },
      // Easy Perfect Square: x^2 + 2Dx + D^2
      (): Partial<Question> => {
        const D = getRandomInt(1, 10);
        return {
          expression: `x^2 + ${2 * D}x + ${D * D}`,
          expectedAnswer: `(x + ${D})^2`,
          type: 'perfect_square'
        };
      },
      // Easy Quadratic: x^2 + (b+d)x + bd (small coefficients)
      (): Partial<Question> => {
        const b = getRandomInt(-5, 5);
        const d = getRandomInt(-5, 5);
        if (b === 0 && d === 0) return { expression: 'x^2', expectedAnswer: '(x)(x)', type: 'quadratic' };
        const linear = b + d;
        const constant = b * d;
        const expr = `x^2${formatTerm(linear, 'x')}${formatTerm(constant, '')}`;
        const signB = b >= 0 ? '+' : '';
        const signD = d >= 0 ? '+' : '';
        return {
          expression: expr,
          expectedAnswer: `(x ${signB} ${Math.abs(b) === 0 ? '0' : Math.abs(b)})(x ${signD} ${Math.abs(d) === 0 ? '0' : Math.abs(d)})`.replace(/\s\s+/g, ' '),
          type: 'quadratic'
        };
      }
    ],
    MEDIUM: [
      // Medium Squares: B^2*x^2 - D^2
      (): Partial<Question> => {
        const B = getRandomInt(2, 5);
        const D = getRandomInt(1, 10);
        return {
          expression: `${B * B}x^2 - ${D * D}`,
          expectedAnswer: `(${B}x + ${D})(${B}x - ${D})`,
          type: 'square_diff'
        };
      },
      // Medium Perfect Square: B^2*x^2 + 2BDx + D^2
      (): Partial<Question> => {
        const B = getRandomInt(2, 5);
        const D = getRandomInt(1, 10);
        return {
          expression: `${B * B}x^2 + ${2 * B * D}x + ${D * D}`,
          expectedAnswer: `(${B}x + ${D})^2`,
          type: 'perfect_square'
        };
      },
      // Medium Quadratic: x^2 + (b+d)x + bd
      (): Partial<Question> => {
        const b = getRandomInt(-10, 10);
        const d = getRandomInt(-10, 10);
        const linear = b + d;
        const constant = b * d;
        const expr = `x^2${formatTerm(linear, 'x')}${formatTerm(constant, '')}`;
        const signB = b >= 0 ? '+' : '-';
        const signD = d >= 0 ? '+' : '-';
        return {
          expression: expr,
          expectedAnswer: `(x ${signB} ${Math.abs(b)})(x ${signD} ${Math.abs(d)})`,
          type: 'quadratic'
        };
      }
    ],
    HARD: [
      // Hard Squares: B^2*x^2 - D^2*y^2
      (): Partial<Question> => {
        const B = getRandomInt(2, 12);
        const D = getRandomInt(2, 12);
        return {
          expression: `${B * B}x^2 - ${D * D}y^2`,
          expectedAnswer: `(${B}x + ${D}y)(${B}x - ${D}y)`,
          type: 'square_diff'
        };
      },
      // Hard General Quadratic: ac*x^2 + (bc+ad)x + bd
      (): Partial<Question> => {
        const a = getRandomInt(2, 6);
        const b = getRandomInt(-6, 6);
        const c = getRandomInt(2, 6);
        const d = getRandomInt(-6, 6);
        const q = a * c;
        const linear = b * c + a * d;
        const constant = b * d;
        const expr = `${q}x^2${formatTerm(linear, 'x')}${formatTerm(constant, '')}`;
        const signB = b >= 0 ? '+' : '-';
        const signD = d >= 0 ? '+' : '-';
        return {
          expression: expr,
          expectedAnswer: `(${a}x ${signB} ${Math.abs(b)})(${c}x ${signD} ${Math.abs(d)})`,
          type: 'general_quad'
        };
      },
      // Hard Perfect Square with y: B^2*x^2 + 2BDxy + D^2*y^2
      (): Partial<Question> => {
        const B = getRandomInt(2, 10);
        const D = getRandomInt(2, 10);
        return {
          expression: `${B * B}x^2 + ${2 * B * D}xy + ${D * D}y^2`,
          expectedAnswer: `(${B}x + ${D}y)^2`,
          type: 'perfect_square'
        };
      }
    ]
  };

  const activeGenerators = generators[difficulty];
  const results: Question[] = [];
  for (let i = 0; i < count; i++) {
    const gen = activeGenerators[i % activeGenerators.length];
    results.push({ id: i, ...gen() } as Question);
  }

  return results.sort(() => Math.random() - 0.5);
};
