import fs from 'node:fs';
import { render } from './src/main';

const lum = fs.readFileSync('./test.lum', 'utf-8');

const result = render(lum);

console.log(result);
