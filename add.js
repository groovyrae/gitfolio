const path = require("path");
const { spawnSync } = require("child_process");

function addCommand(theme, background, accent) {
  const args = [path.resolve(__dirname, "build.sh")];

  if (theme !== undefined) args.push(theme === "null" ? "" : theme);
  if (background !== undefined)
    args.push(background === "null" ? "" : background);
  if (accent !== undefined) args.push(accent === "null" ? "" : accent);

  const result = spawnSync("sh", args, {
    cwd: __dirname,
    stdio: "inherit"
  });

  process.exit(result.status === null ? 1 : result.status);
}

module.exports = {
  addCommand
};