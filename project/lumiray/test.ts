import fs from 'node:fs';
//import { render } from './src/main';
import markdown_render from '@ts-dotnet-packages/markdown-render';

const lum = fs.readFileSync('./test.lum', 'utf-8');

//const result = render(lum);
const result = markdown_render.Renderer.Render(lum);

console.log(result);
