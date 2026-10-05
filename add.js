const path = require("path");
const { spawnSync } = require("child_process");

function addCommand(theme, background, accent) {
  const args = [path.resolve(__dirname, "build.sh")];

  if (theme) args.push(theme);
  if (background) args.push(background);
  if (accent) args.push(accent);

  const result = spawnSync("sh", args, {
    cwd: __dirname,
    stdio: "inherit"
  });

  process.exit(result.status === null ? 1 : result.status);
}

module.exports = {
  addCommand
};