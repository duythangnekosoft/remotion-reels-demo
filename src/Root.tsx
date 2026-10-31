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
import { LastMarbleComposition, LAST_MARBLE_DURATION } from "./LastMarble/LastMarbleComposition";
import { LastMarbleThumbnail } from "./LastMarble/LastMarbleThumbnail";
import { NeonBloomComposition } from "./KineticStudies/NeonBloomComposition";
import { BuildBattleComposition } from "./KineticStudies/BuildBattleComposition";
import { BrickBreakerComposition } from "./KineticStudies/BrickBreakerComposition";
import { MarbleRaceComposition } from "./MarbleRace/MarbleRaceComposition";
import { TerritoryComposition } from "./TerritoryConquest/TerritoryComposition";
import { PlinkoComposition } from "./Plinko/PlinkoComposition";
import { WouldYouRatherComposition } from "./WouldYouRather/WouldYouRatherComposition";
import {
  getGeographyDuration,
  getBibleDuration,
  getNostalgiaDuration,
  getCrazyLawsDuration,
  getChatDramaDuration,
  getMarbleRaceDuration,
  getTerritoryDuration,
  getPlinkoDuration,
  getWouldYouRatherDuration,
} from "./data/timelineUtils";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* ========================================================
          01. MARBLE RACE GRAND PRIX (40.3s)
         ======================================================== */}
        <Folder name="01-Marble-Race">
          <Composition
            id="MarbleRace-GrandPrix"
            component={MarbleRaceComposition}
            durationInFrames={getMarbleRaceDuration(1)}
            fps={30}
            width={1080}
            height={1920}
            defaultProps={{ episode: 1 }}
          />
        </Folder>

        {/* ========================================================
          02. TERRITORY CONQUEST (36.0s - 100% DOMINATION)
         ======================================================== */}
          <Folder name="02-Territory-Conquest">
            <Composition
              id="Territory-Domination"
              component={TerritoryComposition}
              durationInFrames={getTerritoryDuration(1)}
              fps={30}
              width={1080}
              height={1920}
              defaultProps={{ episode: 1 }}
            />
          </Folder>

          {/* ========================================================
          03. LUCKY PLINKO $1M ASMR DROP (33.3s)
         ======================================================== */}
            <Folder name="03-Plinko-ASMR">
              <Composition
                id="Plinko-FortuneDrop"
                component={PlinkoComposition}
                durationInFrames={getPlinkoDuration(1)}
                fps={30}
                width={1080}
                height={1920}
                defaultProps={{ episode: 1 }}
              />
            </Folder>

            {/* ========================================================
          04. WOULD YOU RATHER SHOWDOWN (33.0s)
         ======================================================== */}
              <Folder name="04-Would-You-Rather">
                <Composition
                  id="WouldYouRather-Showdown"
                  component={WouldYouRatherComposition}
                  durationInFrames={getWouldYouRatherDuration(1)}
                  fps={30}
                  width={1080}
                  height={1920}
                  defaultProps={{ episode: 1 }}
                />
              </Folder>

              {/* ========================================================
          05. THE LAST MARBLE - MECHANICAL ASMR (45.0s)
         ======================================================== */}
                <Folder name="05-Last-Marble">
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
                </Folder>

                {/* ========================================================
          06. KINETIC DUEL & ARENA GAMES (35s - 56s)
         ======================================================== */}
                  <Folder name="06-Kinetic-Games">
                    <Composition
                      id="Kinetic-BrickBreaker-1K"
                      component={BrickBreakerComposition}
                      durationInFrames={1680}
                      fps={30}
                      width={720}
                      height={1280}
                    />
                    <Composition
                      id="Kinetic-BuildBattle-35s"
                      component={BuildBattleComposition}
                      durationInFrames={1081}
                      fps={30}
                      width={720}
                      height={1280}
                    />
                    <Composition
                      id="Kinetic-NeonBloom-35s"
                      component={NeonBloomComposition}
                      durationInFrames={1050}
                      fps={30}
                      width={720}
                      height={1280}
                    />
                  </Folder>

                  {/* ========================================================
          07. DATA / BAR CHART RACES (35.0s)
         ======================================================== */}
                  <Folder name="07-Data-Races">
                    <Composition
                      id="BarChartRaceTech"
                      component={BarChartRaceComposition}
                      durationInFrames={1050}
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
                      id="BillionairesRace"
                      component={BillionairesRaceComposition}
                      durationInFrames={1050}
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

                  {/* ========================================================
          08. FAKE iMESSAGE CHAT DRAMA / AITAH (67.0s)
         ======================================================== */}
                    <Folder name="08-AITAH-Chat-Drama">
                      <Composition
                        id="ChatDramaStory"
                        component={ChatDramaComposition}
                        durationInFrames={getChatDramaDuration(1)}
                        fps={30}
                        width={1080}
                        height={1920}
                        defaultProps={{ episode: 1 }}
                      />
                    </Folder>

                    {/* ========================================================
          09. BIBLE & SCRIPTURE TRIVIA (101.2s)
         ======================================================== */}
                      <Folder name="09-Bible-Trivia">
                        <Composition
                          id="BibleTriviaQuiz"
                          component={BibleQuizComposition}
                          durationInFrames={getBibleDuration(1)}
                          fps={30}
                          width={1080}
                          height={1920}
                          defaultProps={{ episode: 1 }}
                        />
                      </Folder>

                      {/* ========================================================
          10. 80s & 90s AMERICAN NOSTALGIA QUIZ (103.6s)
         ======================================================== */}
                        <Folder name="10-80s-90s-Nostalgia">
                          <Composition
                            id="NostalgiaQuiz"
                            component={NostalgiaQuizComposition}
                            durationInFrames={getNostalgiaDuration(1)}
                            fps={30}
                            width={1080}
                            height={1920}
                            defaultProps={{ episode: 1 }}
                          />
                        </Folder>

                        {/* ========================================================
          11. US STATE SECRETS & CRAZY LAWS (103.8s)
         ======================================================== */}
                          <Folder name="11-US-Crazy-Laws">
                            <Composition
                              id="CrazyLawsQuiz"
                              component={CrazyLawsComposition}
                              durationInFrames={getCrazyLawsDuration(1)}
                              fps={30}
                              width={1080}
                              height={1920}
                              defaultProps={{ episode: 1 }}
                            />
                          </Folder>

                          {/* ========================================================
          12. US GEOGRAPHY & AMERICAN IQ QUIZ (101.1s)
         ======================================================== */}
                            <Folder name="12-US-Geography-IQ">
                              <Composition
                                id="USGeographyQuiz"
                                component={QuizComposition}
                                durationInFrames={getGeographyDuration(1)}
                                fps={30}
                                width={1080}
                                height={1920}
                                defaultProps={{ episode: 1 }}
                              />
                            </Folder>
                          </>
                          );
};
