const fs = require('fs');

const files = [
  'src/BarChartRace/BarChartRaceComposition.tsx',
  'src/BibleQuiz/BibleQuizComposition.tsx',
  'src/BillionairesRace/BillionairesRaceComposition.tsx',
  'src/ChatDrama/ChatDramaComposition.tsx',
  'src/CrazyLawsQuiz/CrazyLawsComposition.tsx',
  'src/KineticStudies/BrickBreakerComposition.tsx',
  'src/KineticStudies/BuildBattleComposition.tsx',
  'src/KineticStudies/KineticFiveComposition.tsx',
  'src/KineticStudies/NeonBloomComposition.tsx',
  'src/NostalgiaQuiz/NostalgiaQuizComposition.tsx',
  'src/Quiz/QuizComposition.tsx',
  'src/SingularitySiege/SingularitySiegeComposition.tsx',
];

files.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    // Remove import
    content = content.replace(/import\s*\{\s*StudioBilingualBadge\s*\}\s*from\s*["'][^"']+["'];?\r?\n?/g, '');
    // Remove conditional JSX: {itemMeta && ( <StudioBilingualBadge ... /> )}
    content = content.replace(/\{itemMeta\s*&&\s*\(\s*<StudioBilingualBadge[\s\S]*?\/>\s*\)\}\r?\n?/g, '');
    // Remove standalone JSX: <StudioBilingualBadge ... />
    content = content.replace(/<StudioBilingualBadge[\s\S]*?\/>\r?\n?/g, '');
    fs.writeFileSync(f, content);
    console.log('Cleaned:', f);
  }
});

