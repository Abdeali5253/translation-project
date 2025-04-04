import fs from 'fs/promises';
import path from 'path';

const lexiconDir = path.resolve('lexicons');

export const loadLexiconPrompts = async () => {
  const dialects = ['msa', 'emirati', 'egyptian', 'jordanian', 'palestinian', 'syrian', 'lebanese'];
  const prompts = {};

  for (const dialect of dialects) {
    const filePath = path.join(lexiconDir, `lexicon_${dialect}.json`);
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const entries = JSON.parse(content);
      const formatted = Object.entries(entries)
        .map(([k, v]) => `${k} = ${v}`)
        .join('\n');
      prompts[dialect] = `\n\nفي الترجمة باللهجة ${dialect}، يُرجى استخدام المفردات التالية متى ما كان ذلك مناسبًا:\n${formatted}`;
    } catch (err) {
      console.warn(`⚠️ Lexicon file not found or unreadable for dialect: ${dialect}`);
      prompts[dialect] = '';
    }
  }

  return prompts;
};
