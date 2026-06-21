import { guoxueContentPrompt } from "./guoxue-content";
import { maAnalysisPrompt } from "./ma-analysis";
import { objectionHandlingPrompt } from "./objection-handling";
import { onePageReportPrompt } from "./one-page-report";
import { salesScriptPrompt } from "./sales-script";
import { shortVideoScriptPrompt } from "./short-video-script";

export const promptsByAgentType: Record<string, string> = {
  maAnalysis: maAnalysisPrompt,
  salesScript: salesScriptPrompt,
  objectionHandling: objectionHandlingPrompt,
  onePageReport: onePageReportPrompt,
  guoxueContent: guoxueContentPrompt,
  shortVideoScript: shortVideoScriptPrompt
};
