import React from "react";
import { Composition, Folder } from "remotion";
import { QuizComposition } from "./Quiz/QuizComposition";
import { BarChartRaceComposition } from "./BarChartRace/BarChartRaceComposition";
import { BarChartRaceThumbnail } from "./BarChartRace/BarChartRaceThumbnail";
import { BillionairesRaceComposition } from "./BillionairesRace/BillionairesRaceComposition";
import { BillionairesThumbnail } from "./BillionairesRace/BillionairesThumbnail";
import { BibleQuizComposition } from "./BibleQuiz/BibleQuizComposition";
import { NostalgiaQuizComposition } from "./NostalgiaQuiz/NostalgiaQuizComposition";
import { CrazyLawsComposition } from "./CrazyLawsQuiz/CrazyLawsComposition";
import { ChatDramaComposition } from "./ChatDrama/ChatDramaComposition";
import { SingularitySiegeComposition, getSingularityDuration } from "./SingularitySiege/SingularitySiegeComposition";
import { LastMarbleComposition, LAST_MARBLE_DURATION } from "./LastMarble/LastMarbleComposition";
import { LastMarbleThumbnail } from "./LastMarble/LastMarbleThumbnail";
import {
  getGeographyDuration,
  getBibleDuration,
  getNostalgiaDuration,
  getCrazyLawsDuration,
  getChatDramaDuration,
} from "./data/timelineUtils";

export const RemotionRoot: React.FC = () => {
  const episodes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <>
      {/* ========================================================
          TOPIC 1: BIBLE & ANCIENT SCRIPTURE TRIVIA (10 EPISODES)
         ======================================================== */}
      <Folder name="01-Bible-KinhThanh">
        <Composition
          id="BibleTriviaQuiz-KinhThanh"
          component={BibleQuizComposition}
          durationInFrames={getBibleDuration(1)}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{ episode: 1 }}
        />
        {episodes.map((ep) => (
          <Composition
            key={`BibleQuiz-Ep${ep}-Tap${ep}`}
            id={`BibleQuiz-Ep${ep}-Tap${ep}`}
            component={BibleQuizComposition}
            durationInFrames={getBibleDuration(ep)}
            fps={30}
            width={1080}
            height={1920}
            defaultProps={{ episode: ep }}
          />
        ))}
      </Folder>

      {/* ========================================================
          TOPIC 2: 80s & 90s NOSTALGIA QUIZ (10 EPISODES)
         ======================================================== */}
      <Folder name="02-Nostalgia-HoaiNiem-80s90s">
        <Composition
          id="NostalgiaQuiz-HoaiNiem"
          component={NostalgiaQuizComposition}
          durationInFrames={getNostalgiaDuration(1)}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{ episode: 1 }}
        />
        {episodes.map((ep) => (
          <Composition
            key={`NostalgiaQuiz-Ep${ep}-Tap${ep}`}
            id={`NostalgiaQuiz-Ep${ep}-Tap${ep}`}
            component={NostalgiaQuizComposition}
            durationInFrames={getNostalgiaDuration(ep)}
            fps={30}
            width={1080}
            height={1920}
            defaultProps={{ episode: ep }}
          />
        ))}
      </Folder>

      {/* ========================================================
          TOPIC 3: US STATE SECRETS & CRAZY LAWS (10 EPISODES)
         ======================================================== */}
      <Folder name="03-CrazyLaws-LuatKyQuac">
        <Composition
          id="CrazyLawsQuiz-LuatKyQuac"
          component={CrazyLawsComposition}
          durationInFrames={getCrazyLawsDuration(1)}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{ episode: 1 }}
        />
        {episodes.map((ep) => (
          <Composition
            key={`CrazyLaws-Ep${ep}-Tap${ep}`}
            id={`CrazyLaws-Ep${ep}-Tap${ep}`}
            component={CrazyLawsComposition}
            durationInFrames={getCrazyLawsDuration(ep)}
            fps={30}
            width={1080}
            height={1920}
            defaultProps={{ episode: ep }}
          />
        ))}
      </Folder>

      {/* ========================================================
          TOPIC 4: US GEOGRAPHY & AMERICAN IQ (10 EPISODES)
         ======================================================== */}
      <Folder name="04-Geography-DiaLyMy">
        <Composition
          id="USGeographyQuiz-DiaLyMy"
          component={QuizComposition}
          durationInFrames={getGeographyDuration(1)}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{ episode: 1 }}
        />
        {episodes.map((ep) => (
          <Composition
            key={`GeographyQuiz-Ep${ep}-Tap${ep}`}
            id={`GeographyQuiz-Ep${ep}-Tap${ep}`}
            component={QuizComposition}
            durationInFrames={getGeographyDuration(ep)}
            fps={30}
            width={1080}
            height={1920}
            defaultProps={{ episode: ep }}
          />
        ))}
      </Folder>

      {/* ========================================================
          TOPIC 5: FAKE iMESSAGE / AITAH DRAMA (10 EPISODES)
         ======================================================== */}
      <Folder name="05-ChatDrama-TamSuAITAH">
        <Composition
          id="ChatDramaStory-TamSuAITAH"
          component={ChatDramaComposition}
          durationInFrames={getChatDramaDuration(1)}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{ episode: 1 }}
        />
        {episodes.map((ep) => (
          <Composition
            key={`ChatDrama-Ep${ep}-Tap${ep}`}
            id={`ChatDrama-Ep${ep}-Tap${ep}`}
            component={ChatDramaComposition}
            durationInFrames={getChatDramaDuration(ep)}
            fps={30}
            width={1080}
            height={1920}
            defaultProps={{ episode: ep }}
          />
        ))}
      </Folder>

      {/* ========================================================
          TOPIC 6: KINETIC ASMR SINGULARITY SIEGE & THE LAST MARBLE
         ======================================================== */}
      <Folder name="06-Singularity-VatLyASMR">
        {/* NEW STANDALONE ASMR MASTERPIECE: THE LAST MARBLE */}
        <Composition
          id="LastMarble-MechanicalASMR"
          component={LastMarbleComposition}
          durationInFrames={LAST_MARBLE_DURATION}
          fps={30}
          width={1080}
          height={1920}
        />
        <Composition
          id="LastMarble-Thumbnail"
          component={LastMarbleThumbnail}
          durationInFrames={30}
          fps={30}
          width={1080}
          height={1920}
        />
        <Composition
          id="SingularitySiege-VatLyASMR"
          component={SingularitySiegeComposition}
          durationInFrames={getSingularityDuration(1)}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{ episode: 1 }}
        />
        {episodes.map((ep) => (
          <Composition
            key={`SingularitySiege-Ep${ep}-Tap${ep}`}
            id={`SingularitySiege-Ep${ep}-Tap${ep}`}
            component={SingularitySiegeComposition}
            durationInFrames={getSingularityDuration(ep)}
            fps={30}
            width={1080}
            height={1920}
            defaultProps={{ episode: ep }}
          />
        ))}
      </Folder>

      {/* ========================================================
          TOPIC 7: DATA / BAR CHART RACES & THUMBNAILS
         ======================================================== */}
      <Folder name="07-DataRaces-DuaTopSoLieu">
        <Composition
          id="BarChartRaceTech-CongNghe"
          component={BarChartRaceComposition}
          durationInFrames={600}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{}}
        />
        <Composition
          id="BarChartRaceThumbnail-Thumb"
          component={BarChartRaceThumbnail}
          durationInFrames={30}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{}}
        />
        <Composition
          id="BillionairesRace-TyPhu"
          component={BillionairesRaceComposition}
          durationInFrames={600}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{}}
        />
        <Composition
          id="BillionairesThumbnail-Thumb"
          component={BillionairesThumbnail}
          durationInFrames={30}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{}}
        />
      </Folder>
    </>
  );
};
