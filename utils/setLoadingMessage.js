import logUpdate from "log-update";

import cliSpinners from "cli-spinners";
import chalk from "chalk";

export function setLoadingMessage(message, chalkColor = chalk.white) {
  const frames = cliSpinners.dots.frames;
  let index = 0;

  const intervalId = setInterval(() => {
    const frame = frames[(index = ++index % frames.length)];

    cliSpinners.bounce.frames;

    logUpdate(`${chalkColor(`${frame} ${message}`)}`);
  }, cliSpinners.bounce.interval);

  function resetLoadingMessage(message) {
    logUpdate(`${chalkColor(`${message}`)}`);

    clearInterval(intervalId);
  }

  return resetLoadingMessage;
}
