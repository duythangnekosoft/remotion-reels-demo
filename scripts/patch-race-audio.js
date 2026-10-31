const fs = require('fs');

// 1. BarChartRace
let bcr = fs.readFileSync('src/BarChartRace/BarChartRaceComposition.tsx', 'utf8');
const targetBcr = `      {[171, 252, 393, 494, 514].map((milestoneFrame) => (
        <Sequence key={milestoneFrame} from={milestoneFrame} durationInFrames={12}>
          <Audio src={staticFile("audio/pop.wav")} volume={0.65} />
        </Sequence>
      ))}

      <Sequence from={540} durationInFrames={60}>
        <Audio src={staticFile("audio/celebrate.wav")} volume={0.7} />
      </Sequence>`;

const replaceBcr = `      {MILESTONES.map((m) => {
        const mFrame = Math.round(interpolate(m.year, [2000, 2026], [START_FRAME, END_FRAME]));
        return (
          <Sequence key={m.year} from={mFrame} durationInFrames={12}>
            <Audio src={staticFile("audio/pop.wav")} volume={0.65} />
          </Sequence>
        );
      })}

      <Sequence from={END_FRAME - 15} durationInFrames={60}>
        <Audio src={staticFile("audio/celebrate.wav")} volume={0.7} />
      </Sequence>`;

bcr = bcr.replace(targetBcr.replace(/\r?\n/g, '\r\n'), replaceBcr.replace(/\r?\n/g, '\r\n'));
bcr = bcr.replace(targetBcr.replace(/\r?\n/g, '\n'), replaceBcr.replace(/\r?\n/g, '\n'));
fs.writeFileSync('src/BarChartRace/BarChartRaceComposition.tsx', bcr);
console.log('Patched BarChartRace');

// 2. BillionairesRace
let br = fs.readFileSync('src/BillionairesRace/BillionairesRaceComposition.tsx', 'utf8');
const targetBr = `      {[180, 260, 370, 480, 520].map((milestoneFrame) => (
        <Sequence key={milestoneFrame} from={milestoneFrame} durationInFrames={12}>
          <Audio src={staticFile("audio/pop.wav")} volume={0.65} />
        </Sequence>
      ))}

      <Sequence from={540} durationInFrames={60}>
        <Audio src={staticFile("audio/celebrate.wav")} volume={0.75} />
      </Sequence>`;

const replaceBr = `      {MILESTONES.map((m) => {
        const mFrame = Math.round(interpolate(m.year, [2000, 2026], [START_FRAME, END_FRAME]));
        return (
          <Sequence key={m.year} from={mFrame} durationInFrames={12}>
            <Audio src={staticFile("audio/pop.wav")} volume={0.65} />
          </Sequence>
        );
      })}

      <Sequence from={END_FRAME - 15} durationInFrames={60}>
        <Audio src={staticFile("audio/celebrate.wav")} volume={0.75} />
      </Sequence>`;

br = br.replace(targetBr.replace(/\r?\n/g, '\r\n'), replaceBr.replace(/\r?\n/g, '\r\n'));
br = br.replace(targetBr.replace(/\r?\n/g, '\n'), replaceBr.replace(/\r?\n/g, '\n'));
fs.writeFileSync('src/BillionairesRace/BillionairesRaceComposition.tsx', br);
console.log('Patched BillionairesRace');
